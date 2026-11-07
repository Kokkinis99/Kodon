import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Signal,
  inject,
  signal,
  TemplateRef
} from '@angular/core';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { NgpToast, NgpToastManager, injectToastContext } from 'ng-primitives/toast';
import {
  LucideCircleCheck,
  LucideCircleX,
  LucideInfo,
  LucideLoaderCircle,
  LucideTriangleAlert,
  LucideX
} from '@lucide/angular';

export type KodonToastVariant = 'error' | 'success' | 'info' | 'warning' | 'loading';

/** How a toast leaves when it isn't swiped: slide down and away, or pop in place. */
export type KodonToastExit = 'slide' | 'pop';

/** What a toast shows. KodonToast replaces it when a toast is updated by id. */
export interface KodonToastState {
  message: string;
  variant: KodonToastVariant;
  icon?: TemplateRef<unknown>;
  /** Milliseconds before it closes itself. Infinity keeps it until dismissed or updated. */
  duration: number;
  /** How many toasts this one stands for after grouping. 1 shows no count. */
  count: number;
  /** Progress from 0 to 1 for the bar along the bottom; undefined hides it. */
  progress?: Signal<number | undefined>;
}

export interface KodonToastContext {
  id: string;
  state: Signal<KodonToastState>;
  /** @internal Lets KodonToast reach the component to update or dismiss it by id. */
  register(toast: KodonToastComponent | null): void;
}

/** @internal Access shape for ng-primitives' private timer. */
interface NgpTimer {
  callback: () => void;
  duration: number;
  remainingMs: number;
  /** A persistent timer ignores start(). */
  persistent: boolean;
  start(): void;
  pause(): void;
  stop(): void;
}

/** @internal Access shape for ng-primitives' toast internals. */
interface NgpToastInternal {
  timer: NgpTimer;
  /** True while the stack is expanded or the toast is held or swiped. */
  paused: Signal<boolean>;
}

/**
 * Toast component following Sonner-style animations.
 * Uses CSS transitions instead of keyframes for smooth interruption/retargeting.
 * @see https://emilkowal.ski/ui/building-a-toast-component
 */
@Component({
  selector: 'kodon-toast',
  standalone: true,
  imports: [NgTemplateOutlet, LucideCircleCheck, LucideCircleX, LucideInfo, LucideLoaderCircle, LucideTriangleAlert, LucideX],
  hostDirectives: [NgpToast],
  host: {
    '[attr.data-variant]': 'context.state().variant',
    '[attr.data-updated]': 'updated() || null',
    '[attr.data-progress]': 'context.state().progress?.() !== undefined || null'
  },
  template: `
    @let s = context.state();
    <div class="kodon-toast-content">
      @if (s.icon) {
        <ng-container *ngTemplateOutlet="s.icon" />
      } @else {
        <span class="kodon-toast-icon">
          @switch (s.variant) {
            @case ('error') {
              <svg lucideCircleX [size]="20" [strokeWidth]="2" />
            }
            @case ('success') {
              <svg lucideCircleCheck [size]="20" [strokeWidth]="2" />
            }
            @case ('warning') {
              <svg lucideTriangleAlert [size]="20" [strokeWidth]="2" />
            }
            @case ('info') {
              <svg lucideInfo [size]="20" [strokeWidth]="2" />
            }
            @case ('loading') {
              <svg lucideLoaderCircle class="kodon-toast-spinner" [size]="20" [strokeWidth]="2" />
            }
          }
        </span>
      }
      <!-- Keyed on the text, so an update swaps in a fresh span that fades in. -->
      @for (message of [s.message]; track message) {
        <span class="kodon-toast-message">{{ message }}</span>
      }
      @if (s.count > 1) {
        <!-- Keyed on the count, so each new one pops in. -->
        @for (count of [s.count]; track count) {
          <span class="kodon-toast-count" [attr.aria-label]="count + ' times'">×{{ count }}</span>
        }
      }
      <button
        type="button"
        class="kodon-toast-close"
        (click)="dismiss('pop')"
        aria-label="Dismiss toast"
      >
        <svg lucideX [size]="16" [strokeWidth]="2" />
      </button>
      @let progress = s.progress?.();
      @if (progress !== undefined) {
        <span
          class="kodon-toast-progress"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          [attr.aria-valuenow]="percent(progress)"
          [style.--kodon-progress]="clamp(progress)"
        ></span>
      }
    </div>
  `,
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KodonToastComponent implements OnInit, OnDestroy {
  private readonly _toastManager = inject(NgpToastManager);
  private readonly _ngpToast = inject(NgpToast);
  private readonly _elementRef = inject(ElementRef<HTMLElement>);
  private readonly _document = inject(DOCUMENT);
  private readonly _listeners = new AbortController();

  public readonly context = injectToastContext<KodonToastContext>();

  /** Set once the toast has been updated in place, so only swaps animate, not the first render. */
  protected readonly updated = signal(false);

  private _exiting = false;

  /** @internal True once the toast has started to leave, by timing out, ×, or a swipe. */
  public get exiting(): boolean {
    return this._exiting || this._elementRef.nativeElement.hasAttribute('data-exit');
  }

  protected clamp(progress: number): number {
    return Math.min(1, Math.max(0, progress));
  }

  protected percent(progress: number): number {
    return Math.round(this.clamp(progress) * 100);
  }

  /** Cached reference to the ng-primitives container element. */
  private _container: HTMLElement | null = null;

  /**
   * Wraps the internal timer callback so the exit animation starts
   * before ng-primitives calls detach(). This ensures getAnimations()
   * (called synchronously inside setupExitAnimation.exit()) finds the
   * WAAPI animation already running and waits for it.
   */
  ngOnInit(): void {
    this._container = this._elementRef.nativeElement.parentElement;
    const timer = this._internal.timer;
    const original = timer.callback;
    timer.callback = () => {
      this._exiting = true;
      this._startExitAnimation();
      original();
    };

    // A toast that times out in a background tab is gone before anyone sees it. While the
    // tab is hidden the timer doesn't run, and a toast shown meanwhile waits for the user.
    const start = timer.start.bind(timer);
    timer.start = () => {
      if (!this._document.hidden) start();
    };
    this._document.addEventListener(
      'visibilitychange',
      () => {
        if (this._document.hidden) timer.pause();
        else if (!this._internal.paused()) timer.start();
      },
      { signal: this._listeners.signal }
    );

    this.restartTimer();

    this._installContainerGuard();
    this.context.register(this);
  }

  ngOnDestroy(): void {
    this._listeners.abort();
    this.context.register(null);
  }

  /**
   * @internal Called by KodonToast after it replaces the state. A grouped toast gives a
   * small bump so a repeat doesn't go unnoticed.
   */
  public onUpdated(grouped = false): void {
    this.updated.set(true);
    this.restartTimer();
    if (grouped) this._bump();
  }

  private _bump(): void {
    const el = this._elementRef.nativeElement;
    if (el.dataset['visible'] === 'false' || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // The scale property, so it composes with the stack's transforms instead of replacing them.
    el.animate([{ scale: '1' }, { scale: '1.03', offset: 0.35 }, { scale: '1' }], {
      duration: 260,
      easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)'
    });
  }

  /** Starts the countdown over from the current state's duration. */
  private restartTimer(): void {
    const timer = this._internal.timer;
    const duration = this.context.state().duration;
    timer.stop();
    // ng-primitives starts the timer again whenever the stack collapses. A toast that
    // waits (a loading toast, or duration: Infinity) is marked persistent so it doesn't.
    timer.persistent = !Number.isFinite(duration);
    if (timer.persistent) return;
    timer.duration = duration;
    timer.remainingMs = duration;
    // Hovered or held, the stack stays paused; ng-primitives starts it again on leave.
    if (!this._internal.paused()) timer.start();
  }

  private get _internal(): NgpToastInternal {
    return this._ngpToast as unknown as NgpToastInternal;
  }

  /**
   * Dismisses the toast. Timing out slides it away; the × button pops it, like a bubble.
   * Pass 'pop' to get the same exit from your own close control.
   */
  public dismiss(exit: KodonToastExit = 'slide'): void {
    this._exiting = true;
    this._startExitAnimation(exit);
    this._toastManager.dismiss(this._ngpToast);
  }

  /**
   * Installs a single mouseleave guard on the container (once per container).
   *
   * ng-primitives collapses the stack on any mouseleave. During a swipe or
   * exit animation the mouse can leave the container's bounds while a toast
   * is still mid-gesture. This guard re-dispatches mouseenter whenever a
   * toast is swiping or exiting, keeping the stack expanded. When the
   * restriction lifts, normal mouseleave events flow through unchanged.
   */
  private _installContainerGuard(): void {
    const c = this._container;
    if (!c) return;
    const ca = c as unknown as Record<string, unknown>;
    if (ca['_kodonGuard']) return;
    ca['_kodonGuard'] = true;

    // Closure variable — avoids relying on data-swiping being in the DOM,
    // which Angular only writes on the next CD cycle (too late for mouseleave).
    let pointerActive = false;

    c.addEventListener('pointerdown', () => { pointerActive = true; });

    const onPointerEnd = () => {
      setTimeout(() => {
        pointerActive = false;
        if (!ca['_kodonExiting'] && !c.matches(':hover')) {
          c.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
        }
      }, 400);
    };
    c.addEventListener('pointerup', onPointerEnd);
    c.addEventListener('pointercancel', onPointerEnd);

    c.addEventListener('mouseleave', () => {
      if (ca['_kodonExiting'] || pointerActive) {
        c.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
      }
    });
  }

  /**
   * Plays the exit animation via the Web Animations API directly on the
   * host element. Called before dismiss so getAnimations() detects it.
   * Skipped when swiping — the swipe gesture handles its own visual exit.
   *
   * Also preemptively updates sibling positions so they start transitioning
   * immediately rather than waiting for portal.detach() to resolve (~350ms).
   * ng-primitives only updates the signal array after detach completes, so
   * without this, siblings don't move until the exit animation is already done.
   */
  private _startExitAnimation(exit: KodonToastExit = 'slide'): void {
    const el = this._elementRef.nativeElement;
    const isSwiping = el.dataset['swiping'] === 'true';
    const isVisible = el.dataset['visible'] !== 'false';
    if (isSwiping || !isVisible || !el.isConnected) return;

    this._preemptRestack();

    // Keep the container locked in expanded state while the toast exits.
    // The flag lives on the container object so it survives element removal:
    // the real mouseleave fires *after* the DOM node is removed and the
    // container resizes — by then el.dataset['exit'] is already gone, but
    // this flag is still alive until the 600ms window expires.
    const c = this._container;
    const ca = c ? (c as unknown as Record<string, unknown>) : null;
    if (c && ca) {
      ca['_kodonExiting'] = true;
      setTimeout(() => {
        ca['_kodonExiting'] = false;
        if (!c.matches(':hover')) {
          c.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
        }
      }, 600);
    }

    // With reduced motion, both exits are a plain fade.
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (exit === 'pop') {
      // Swells a little, then shrinks into its centre as it fades.
      el.animate(
        still
          ? [{ opacity: '1' }, { opacity: '0' }]
          : [
              {
                transform: 'scale(1)',
                opacity: '1',
                filter: 'blur(0px)',
                easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
              },
              {
                transform: 'scale(1.02)',
                opacity: '1',
                filter: 'blur(0px)', // sharp until it starts to shrink
                offset: 0.3,
                easing: 'cubic-bezier(0.55, 0, 1, 0.45)'
              },
              { transform: 'scale(0.5)', opacity: '0', filter: 'blur(1px)' }
            ],
        { duration: still ? 150 : 180, fill: 'forwards' }
      );
      return;
    }

    // Out the way it came in: down for bottom placements, up for top ones.
    const away = el.dataset['positionY'] === 'top' ? '-110%' : '110%';
    el.animate(
      still
        ? [{ opacity: '1' }, { opacity: '0' }]
        : [
            { transform: 'translateY(0)', opacity: '1', filter: 'blur(0px)' },
            { transform: `translateY(${away})`, opacity: '0', filter: 'blur(2px)' }
          ],
      {
        duration: 350,
        easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)',
        fill: 'forwards'
      }
    );
  }

  /**
   * Immediately updates --ngp-toast-index / --ngp-toast-offset on sibling
   * toasts so their CSS transitions start in sync with the exit animation.
   * ng-primitives will overwrite these inline styles once the animation ends,
   * but by then the values will match, so there is no visual jump.
   */
  private _preemptRestack(): void {
    const el = this._elementRef.nativeElement;
    const container = el.parentElement;
    if (!container) return;

    const thisIdx = this._ngpIndex(el);
    const isExpanded = el.dataset['expanded'] === 'true';
    const gap = parseFloat(el.style.getPropertyValue('--ngp-toast-gap') || '14');

    for (const sibling of Array.from(container.children) as HTMLElement[]) {
      if (sibling === el) continue;
      const sibIdx = this._ngpIndex(sibling);
      if (sibIdx <= thisIdx) continue;

      if (isExpanded) {
        const exitHeight = el.getBoundingClientRect().height;
        const current = parseFloat(sibling.style.getPropertyValue('--ngp-toast-offset') || '0');
        sibling.style.setProperty('--ngp-toast-offset', `${Math.max(0, current - exitHeight - gap)}px`);
      } else {
        sibling.style.setProperty('--ngp-toast-index', String(sibIdx - 1));
      }
    }
  }

  private _ngpIndex(el: HTMLElement): number {
    return parseInt(el.style.getPropertyValue('--ngp-toast-index') || '1');
  }

}
