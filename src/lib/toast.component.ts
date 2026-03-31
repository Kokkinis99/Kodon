import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  inject,
  TemplateRef
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgpToast, NgpToastManager, injectToastContext } from 'ng-primitives/toast';
import {
  LucideAngularModule,
  CircleX,
  CircleCheck,
  TriangleAlert,
  Info,
  X
} from 'lucide-angular';

export type KodonToastVariant = 'error' | 'success' | 'info' | 'warning';

export interface KodonToastContext {
  message: string;
  variant: KodonToastVariant;
  icon?: TemplateRef<unknown>;
}

/** @internal Access shape for ng-primitives' private timer property. */
interface NgpToastInternal {
  timer: { callback: () => void };
}

/**
 * Toast component following Sonner-style animations.
 * Uses CSS transitions instead of keyframes for smooth interruption/retargeting.
 * @see https://emilkowal.ski/ui/building-a-toast-component
 */
@Component({
  selector: 'kodon-toast',
  standalone: true,
  imports: [NgTemplateOutlet, LucideAngularModule],
  hostDirectives: [NgpToast],
  host: {
    '[attr.data-variant]': 'context.variant'
  },
  template: `
    <div class="kodon-toast-content">
      @if (context.icon) {
        <ng-container *ngTemplateOutlet="context.icon" />
      } @else {
        <span class="kodon-toast-icon">
          @switch (context.variant) {
            @case ('error') {
              <lucide-icon [img]="CircleX" [size]="20" [strokeWidth]="2" />
            }
            @case ('success') {
              <lucide-icon [img]="CircleCheck" [size]="20" [strokeWidth]="2" />
            }
            @case ('warning') {
              <lucide-icon [img]="TriangleAlert" [size]="20" [strokeWidth]="2" />
            }
            @case ('info') {
              <lucide-icon [img]="Info" [size]="20" [strokeWidth]="2" />
            }
          }
        </span>
      }
      <span class="kodon-toast-message">{{ context.message }}</span>
      <button
        type="button"
        class="kodon-toast-close"
        (click)="dismiss()"
        aria-label="Dismiss toast"
      >
        <lucide-icon [img]="X" [size]="16" [strokeWidth]="2" />
      </button>
    </div>
  `,
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KodonToastComponent implements OnInit {
  private readonly _toastManager = inject(NgpToastManager);
  private readonly _ngpToast = inject(NgpToast);
  private readonly _elementRef = inject(ElementRef<HTMLElement>);

  public readonly context = injectToastContext<KodonToastContext>();

  // Lucide icons
  protected readonly CircleX = CircleX;
  protected readonly CircleCheck = CircleCheck;
  protected readonly TriangleAlert = TriangleAlert;
  protected readonly Info = Info;
  protected readonly X = X;

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
    const internal = this._ngpToast as unknown as NgpToastInternal;
    const original = internal.timer.callback;
    internal.timer.callback = () => {
      this._startExitAnimation();
      original();
    };
    this._installContainerGuard();
  }

  public dismiss(): void {
    this._startExitAnimation();
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
  private _startExitAnimation(): void {
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

    el.animate(
      [
        { transform: 'translateY(0)', opacity: '1', filter: 'blur(0px)' },
        { transform: 'translateY(110%)', opacity: '0', filter: 'blur(2px)' }
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
