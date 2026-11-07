import { Component, inject, resource, signal } from '@angular/core';
import { KodonToast } from '../../src/lib/toast.service';

/** The recorder slows animations down to capture every frame; timers here follow suit. */
const slow = () => (window as unknown as { SLOW?: number }).SLOW ?? 1;

interface Caption {
  id: number;
  words: string[];
  sub?: string;
  leaving: boolean;
}

/**
 * A stage for the promo video. Nothing here runs on its own: the recording script
 * (promo/record.mjs) calls window.promo to play each scene, and drives the
 * real mouse for hovering and swiping.
 */
@Component({
  selector: 'promo-root',
  standalone: true,
  template: `
    <div class="stage">
      <div class="grid"></div>

      <div class="mark" [class.on]="mark()">Kōdon</div>

      @if (intro()) {
        <div class="logo" [class.leaving]="introLeaving()">
          <h1 class="logo-word">
            @for (ch of 'Kōdon'.split(''); track $index) {
              <span [style.--i]="$index">{{ ch }}</span>
            }
          </h1>
          <p class="logo-sub">Toasts for Angular</p>
        </div>
      }

      <div class="captions" [class.nudged]="nudged()">
        @for (c of captions(); track c.id) {
          <div class="caption" [class.leaving]="c.leaving">
            <p class="caption-main">
              @for (w of c.words; track $index) {
                <span class="word" [style.--i]="$index">{{ w }}</span>
              }
            </p>
            @if (c.sub) {
              <p class="caption-sub">{{ c.sub }}</p>
            }
          </div>
        }
      </div>

      @if (outro()) {
        <div class="outro">
          <h2 class="outro-word">Kōdon</h2>
          <p class="outro-line">Sonner-style toasts for Angular, on ng-primitives.</p>
          <p class="outro-line soft">Copy the files. Own the code.</p>
          <span class="outro-url">kodon.kokkin.is</span>
        </div>
      }

      <svg class="cursor" [class.on]="cursor()" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 3l14 7.5-6.2 1.6L10 18.5z"
          fill="hsl(0 0% 8%)"
          stroke="white"
          stroke-width="1.6"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  `,
  styles: [`
    /* Absolute, not fixed: a fixed stage would be its own stacking context and the cursor
       inside it would sit under the toast containers. */
    .stage {
      position: absolute;
      inset: 0;
      overflow: hidden;
    }

    .grid {
      position: absolute;
      inset: 0;
      background-image: radial-gradient(var(--dot) 1px, transparent 1.2px);
      background-size: 22px 22px;
      mask-image: radial-gradient(ellipse 70% 65% at 50% 45%, black 30%, transparent 100%);
    }

    .mark {
      position: absolute;
      top: 22px;
      left: 26px;
      font-size: 15px;
      font-weight: 600;
      letter-spacing: -0.01em;
      opacity: 0;
      translate: 0 -4px;
      transition: opacity 400ms ease, translate 500ms var(--ease-out);
    }
    .mark.on {
      opacity: 1;
      translate: 0 0;
    }

    /* Intro */
    .logo {
      position: absolute;
      inset: 0;
      display: grid;
      place-content: center;
      text-align: center;
      transition: opacity 350ms ease, scale 450ms var(--ease-out), filter 350ms ease;
    }
    .logo.leaving {
      opacity: 0;
      scale: 0.94;
      filter: blur(6px);
    }
    .logo-word {
      margin: 0;
      font-size: 112px;
      font-weight: 600;
      letter-spacing: -0.045em;
      line-height: 1;
    }
    .logo-word span {
      display: inline-block;
      animation: rise 700ms var(--spring) both;
      animation-delay: calc(var(--i) * 55ms + 150ms);
    }
    .logo-sub {
      margin: 18px 0 0;
      font-size: 22px;
      font-weight: 500;
      color: var(--ink-soft);
      animation: fade-up 600ms var(--ease-out) both 650ms;
    }

    /* Scene captions */
    .captions {
      position: absolute;
      inset: 0 0 auto;
      height: 310px;
      display: grid;
    }
    /* Shoved aside when a toast lands on the caption. */
    .captions {
      transition: translate 500ms var(--spring);
    }
    .captions.nudged {
      translate: 0 46px;
    }
    .caption {
      grid-area: 1 / 1;
      align-self: center;
      text-align: center;
      transition: opacity 260ms ease, translate 320ms var(--ease-out), filter 260ms ease;
    }
    .caption.leaving {
      opacity: 0;
      translate: 0 -14px;
      filter: blur(5px);
    }
    .caption-main {
      margin: 0;
      font-size: 60px;
      font-weight: 600;
      letter-spacing: -0.04em;
      line-height: 1.05;
    }
    .word {
      display: inline-block;
      margin: 0 0.12em;
      animation: rise 650ms var(--spring) both;
      animation-delay: calc(var(--i) * 70ms);
    }
    .caption-sub {
      margin: 14px 0 0;
      font-family: 'JetBrains Mono', monospace;
      font-size: 15px;
      color: var(--ink-soft);
      animation: fade-up 500ms var(--ease-out) both 220ms;
    }

    /* Outro */
    .outro {
      position: absolute;
      inset: 0;
      display: grid;
      place-content: center;
      justify-items: center;
      text-align: center;
    }
    .outro-word {
      margin: 0 0 14px;
      font-size: 88px;
      font-weight: 600;
      letter-spacing: -0.045em;
      line-height: 1;
      animation: rise 700ms var(--spring) both;
    }
    .outro-line {
      margin: 6px 0 0;
      font-size: 20px;
      font-weight: 500;
      animation: fade-up 550ms var(--ease-out) both 250ms;
    }
    .outro-line.soft {
      color: var(--ink-soft);
      animation-delay: 380ms;
    }
    .outro-url {
      margin-top: 28px;
      padding: 10px 18px;
      border-radius: 999px;
      background: var(--ink);
      color: var(--paper);
      font-family: 'JetBrains Mono', monospace;
      font-size: 16px;
      animation: pop 600ms var(--spring) both 620ms;
    }

    /* A stand-in for the pointer, which headless Chrome doesn't draw. */
    .cursor {
      position: fixed;
      left: 0;
      top: 0;
      z-index: 2147483647;
      pointer-events: none;
      translate: var(--x, -40px) var(--y, -40px);
      opacity: 0;
      scale: 0.6;
      transition: opacity 200ms ease, scale 300ms var(--spring);
      filter: drop-shadow(0 2px 3px rgb(0 0 0 / 0.18));
    }
    .cursor.on {
      opacity: 1;
      scale: 1;
    }

    @keyframes rise {
      from {
        opacity: 0;
        translate: 0 0.45em;
        filter: blur(8px);
      }
    }
    @keyframes fade-up {
      from {
        opacity: 0;
        translate: 0 8px;
      }
    }
    @keyframes pop {
      from {
        opacity: 0;
        scale: 0.7;
      }
    }
  `]
})
export class PromoComponent {
  readonly toast = inject(KodonToast);

  readonly intro = signal(false);
  readonly introLeaving = signal(false);
  readonly outro = signal(false);
  readonly mark = signal(false);
  readonly cursor = signal(false);
  readonly nudged = signal(false);
  readonly captions = signal<Caption[]>([]);
  private nextId = 0;

  /** A report that takes a moment to load, followed by toast.resource(). */
  private readonly reportVersion = signal(0);
  private readonly report = resource({
    params: () => this.reportVersion() || undefined,
    loader: () => new Promise<number>(r => setTimeout(() => r(1284), 1100 * slow()))
  });

  constructor() {
    this.toast.resource(this.report, {
      loading: 'Loading the report…',
      success: rows => `Report ready: ${rows.toLocaleString('en')} rows`
    });
    document.addEventListener('pointermove', e => {
      const style = document.documentElement.style;
      style.setProperty('--x', `${e.clientX - 3}px`);
      style.setProperty('--y', `${e.clientY - 2}px`);
    });
    (window as unknown as { promo: PromoComponent }).promo = this;
  }

  showIntro(): void {
    this.intro.set(true);
  }

  hideIntro(): void {
    this.introLeaving.set(true);
    setTimeout(() => this.intro.set(false), 500 * slow());
  }

  loadReport(): void {
    this.reportVersion.update(v => v + 1);
  }

  /** An upload whose progress signal fills in a few uneven steps, then succeeds. */
  upload(): void {
    const progress = signal(0);
    this.toast.loading('Uploading launch-video.mp4…', { id: 'upload', progress });
    const steps = [0.18, 0.41, 0.55, 0.83, 1];
    steps.forEach((p, i) => setTimeout(() => progress.set(p), (i + 1) * 280 * slow()));
    setTimeout(() => this.toast.success('launch-video.mp4 uploaded', { id: 'upload' }), (steps.length * 280 + 300) * slow());
  }

  caption(text: string, sub?: string): void {
    this.leaveCaptions();
    this.captions.update(list => [...list, { id: ++this.nextId, words: text.split(' '), sub, leaving: false }]);
  }

  clearCaption(): void {
    this.leaveCaptions();
  }

  showOutro(): void {
    this.outro.set(true);
  }

  private leaveCaptions(): void {
    this.captions.update(list => list.map(c => ({ ...c, leaving: true })));
    const leaving = this.captions().map(c => c.id);
    setTimeout(() => this.captions.update(list => list.filter(c => !leaving.includes(c.id))), 400 * slow());
  }
}
