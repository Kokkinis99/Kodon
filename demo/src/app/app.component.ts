import {
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { KodonToast } from '../../../src/lib/toast.service';
import { KodonToastVariant } from '../../../src/lib/toast.component';
import { KodonToastPlacement } from '../../../src/lib/provide-toast';
import {
  LucideCircleCheck,
  LucideCircleX,
  LucideFileCode,
  LucideGitBranch,
  LucideInfo,
  LucideLayers,
  LucideLoaderCircle,
  LucideRefreshCw,
  LucideTriangleAlert
} from '@lucide/angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LucideCircleCheck, LucideCircleX, LucideFileCode, LucideGitBranch, LucideInfo, LucideLayers, LucideLoaderCircle, LucideRefreshCw, LucideTriangleAlert],
  template: `
    <main class="container">
      <section class="page-intro">
        <header class="header">
          <span class="heading-sm">Kōdon</span>
          <div class="options">
            <a
              class="icon-button"
              href="https://github.com/Kokkinis99/kodon"
              target="_blank"
              rel="noopener"
              aria-label="View on GitHub"
            >
              <svg lucideGitBranch [size]="16" [strokeWidth]="2" />
            </a>
          </div>
        </header>

        <p class="career-info heading-sm">
          Toast notifications for Angular
        </p>

        <p class="description body">
          A Sonner-inspired toast component built on ng-primitives.
          Smooth animations, swipe to dismiss, and stackable.
        </p>
      </section>

      <section class="main">
        <div class="playground">
          <div class="demo-section">
            <button class="toast-btn success" (click)="showToast('success')">
              <svg lucideCircleCheck [size]="16" [strokeWidth]="2.5" />
              Success
            </button>
            <button class="toast-btn error" (click)="showToast('error')">
              <svg lucideCircleX [size]="16" [strokeWidth]="2.5" />
              Error
            </button>
            <button class="toast-btn warning" (click)="showToast('warning')">
              <svg lucideTriangleAlert [size]="16" [strokeWidth]="2.5" />
              Warning
            </button>
            <button class="toast-btn info" (click)="showToast('info')">
              <svg lucideInfo [size]="16" [strokeWidth]="2.5" />
              Info
            </button>
            <button class="stack-btn" (click)="showPromise()">
              <svg lucideLoaderCircle [size]="16" [strokeWidth]="2" />
              Promise
            </button>
            <button class="stack-btn" (click)="showUpdate()">
              <svg lucideRefreshCw [size]="16" [strokeWidth]="2" />
              Update in place
            </button>
            <button class="stack-btn" (click)="showStack()">
              <svg lucideLayers [size]="16" [strokeWidth]="2" />
              Stack
            </button>
          </div>

          <div class="stage">
            <div class="placement-screen" role="radiogroup" aria-label="Placement">
              @for (p of placements; track p) {
                <button
                  type="button"
                  role="radio"
                  [class]="'placement-spot ' + p"
                  [attr.aria-checked]="placement() === p"
                  [attr.aria-label]="p"
                  (click)="placement.set(p)"
                >
                  <span class="placement-bar"></span>
                </button>
              }
              @for (name of [placement()]; track name) {
                <span class="placement-name">{{ name }}</span>
              }
            </div>

            <!-- Keyed on the text: each new snippet is a fresh element that fades in. -->
            <pre class="code-block live-code" #code><code>@for (code of [snippet()]; track code) {<span class="snippet">{{ code }}</span>}</code></pre>
          </div>


        </div>

        <div class="setup">
          <div class="setup-step">
            <p class="heading-tt step-label">1. Install peer dependencies</p>
            <pre class="code-block"><code>npm install ng-primitives @lucide/angular</code></pre>
          </div>

          <div class="setup-step">
            <p class="heading-tt step-label">2. Copy these files into your project</p>
            <div class="file-list">
              <a class="file-link" href="https://github.com/Kokkinis99/kodon/blob/main/src/lib/toast.component.ts" target="_blank" rel="noopener">
                <svg lucideFileCode [size]="13" [strokeWidth]="2" />
                toast.component.ts
              </a>
              <a class="file-link" href="https://github.com/Kokkinis99/kodon/blob/main/src/lib/toast.service.ts" target="_blank" rel="noopener">
                <svg lucideFileCode [size]="13" [strokeWidth]="2" />
                toast.service.ts
              </a>
              <a class="file-link" href="https://github.com/Kokkinis99/kodon/blob/main/src/lib/provide-toast.ts" target="_blank" rel="noopener">
                <svg lucideFileCode [size]="13" [strokeWidth]="2" />
                provide-toast.ts
              </a>
              <a class="file-link" href="https://github.com/Kokkinis99/kodon/blob/main/src/lib/toast.component.scss" target="_blank" rel="noopener">
                <svg lucideFileCode [size]="13" [strokeWidth]="2" />
                toast.component.scss
              </a>
              <a class="file-link" href="https://github.com/Kokkinis99/kodon/blob/main/src/lib/_toast-visuals.scss" target="_blank" rel="noopener">
                <svg lucideFileCode [size]="13" [strokeWidth]="2" />
                _toast-visuals.scss
              </a>
            </div>
          </div>

          <div class="setup-step">
            <p class="heading-tt step-label">3. Wire it up</p>
            <pre class="code-block"><code>// app.config.ts
provideKodonToast(&#123; placement: 'bottom-end' &#125;)</code></pre>
          </div>

          <div class="setup-step">
            <p class="heading-tt step-label">4. Use it</p>
            <pre class="code-block"><code>toast = inject(KodonToast)

this.toast.success('Changes saved')
this.toast.error('Something went wrong')</code></pre>
          </div>
        </div>

        <div class="docs">
          <p class="heading-sm docs-heading">Customising</p>

          <p class="body docs-body">
            The files are split on purpose.
            <code class="inline-code">_toast-visuals.scss</code> owns colors, typography, and variant styles.
            <code class="inline-code">toast.component.scss</code> owns animations, stacking, and layout.
            You can rework the visuals without touching the animation logic, or replace both entirely.
          </p>

          <div class="code-pair">
            <div class="code-pair-item">
              <p class="body-sm docs-label">Override colors in your global styles — or just edit the file directly:</p>
              <pre class="code-block"><code>/* globals.scss */
:root &#123;
  --kodon-toast-success-bg: hsl(142 76% 96%);
  --kodon-toast-success-border: hsl(142 76% 82%);
  --kodon-toast-success-text: hsl(142 76% 18%);
  --kodon-toast-success-icon: hsl(142 76% 36%);

  /* same pattern for error, warning, info */
&#125;</code></pre>
            </div>

            <div class="code-pair-item">
              <p class="body-sm docs-label">Adjust animation feel in <code class="inline-code">toast.component.scss</code>:</p>
              <pre class="code-block"><code>:host &#123;
  /* stacking */
  --kodon-toast-peek: 11px;
  /* layout */
  --kodon-toast-width: 355px;
  --kodon-toast-border-radius: 10px;
  /* motion */
  --kodon-toast-duration: 350ms;
  --kodon-toast-easing: cubic-bezier(0.165, 0.84, 0.44, 1);
&#125;</code></pre>
            </div>
          </div>

          <p class="body docs-body">
            The animations use CSS transitions, not keyframes — so they can be interrupted mid-flight.
            If a new toast arrives while one is entering, it picks up from wherever it is rather than restarting.
            Exit runs via the Web Animations API so it can complete before the DOM node is removed.
          </p>
        </div>

        <footer class="footer">
          <span>Made by</span>
          <a
            href="https://kokkin.is"
            target="_blank"
            rel="noopener"
          >
            George Kokkinis
          </a>
        </footer>
      </section>
    </main>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      padding-top: 8rem;
    }

    .page-intro {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.625rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .options {
      display: flex;
      align-items: center;
      gap: 0.3125rem;
    }

    .icon-button {
      background: none;
      border: none;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
      padding: 4px;
      border-radius: 4px;
      color: var(--color-text);
      text-decoration: none;
      transition:
        transform var(--duration-fast) var(--ease-out-quart),
        background-color var(--duration-standard) ease;
    }

    .icon-button:active {
      transform: scale(0.97);
    }

    @media (hover: hover) and (pointer: fine) {
      .icon-button:hover {
        background: var(--color-hover);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .icon-button {
        transition: none;
      }
    }

    .career-info {
      color: var(--color-text-secondary);
    }

    .description {
      color: var(--color-text);
      text-wrap: pretty;
      max-width: 400px;
    }

    .main {
      margin-top: 4rem;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 4rem;
    }

    .demo-section {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }

    .toast-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 8px 16px;
      border-radius: 8px;
      font-family: inherit;
      font-size: var(--font-size-14);
      line-height: 1;
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      white-space: nowrap;
      -webkit-font-smoothing: antialiased;
    }

    .toast-btn svg {
      flex-shrink: 0;
      display: flex;
    }

    .toast-btn.success {
      background: #10b981;
      border: 1px solid #059669;
      color: white;
    }

    .toast-btn.error {
      background: #ef4444;
      border: 1px solid #dc2626;
      color: white;
    }

    .toast-btn.warning {
      background: #f59e0b;
      border: 1px solid #d97706;
      color: white;
    }

    .toast-btn.info {
      background: #3b82f6;
      border: 1px solid #2563eb;
      color: white;
    }

    .playground {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    /* The placement screen sits to the left of the code it changes. */
    .stage {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }
    .stage .live-code {
      flex: 1;
      min-width: 0;
    }
    /* A little screen: pick where the toasts go. */
    .placement-screen {
      position: relative;
      flex-shrink: 0;
      width: 160px;
      aspect-ratio: 16 / 10;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr 1fr;
      padding: 4px;
      box-sizing: border-box;
      border: 1px solid var(--color-border);
      border-radius: 10px;
      background: var(--color-hover);
    }
    .placement-spot {
      display: flex;
      padding: 6px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .placement-spot.top-start, .placement-spot.bottom-start { justify-content: flex-start; }
    .placement-spot.top-center, .placement-spot.bottom-center { justify-content: center; }
    .placement-spot.top-end, .placement-spot.bottom-end { justify-content: flex-end; }
    .placement-spot.top-start, .placement-spot.top-center, .placement-spot.top-end { align-items: flex-start; }
    .placement-spot.bottom-start, .placement-spot.bottom-center, .placement-spot.bottom-end { align-items: flex-end; }
    .placement-bar {
      width: 26px;
      height: 8px;
      border-radius: 3px;
      background: var(--color-border);
      transition:
        background-color var(--duration-slow) var(--ease-out-quad),
        scale var(--duration-fast) var(--ease-out-quart);
    }
    @media (hover: hover) and (pointer: fine) {
      .placement-spot:hover .placement-bar {
        background: var(--color-text-link);
      }
    }
    .placement-spot:active .placement-bar {
      scale: 0.92;
    }
    .placement-spot[aria-checked='true'] .placement-bar {
      background: var(--color-text);
    }
    .placement-spot:focus-visible {
      outline: 2px solid var(--color-text);
      outline-offset: -2px;
    }
    .placement-name {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: var(--font-size-12);
      color: var(--color-text-secondary);
      pointer-events: none;
      transition: opacity 200ms ease, filter 200ms ease;
      @starting-style {
        opacity: 0;
        filter: blur(2px);
      }
    }
    .live-code {
      line-height: 1.5;
      overflow: hidden;
    }
    .snippet {
      display: block;
      transition:
        opacity 220ms ease,
        translate 260ms var(--ease-out-quart),
        filter 220ms ease;
      @starting-style {
        opacity: 0;
        translate: 0 4px;
        filter: blur(3px);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .snippet {
        transition: opacity 150ms ease;
        @starting-style {
          translate: none;
          filter: none;
        }
      }
    }
    @media (max-width: 640px) {
      .stage {
        flex-direction: column;
        align-items: stretch;
      }
      .placement-screen {
        width: 100%;
        height: 84px;
        aspect-ratio: auto;
      }
    }
    .stack-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 8px 16px;
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: 8px;
      color: var(--color-text);
      font-family: inherit;
      font-size: var(--font-size-14);
      font-weight: var(--font-weight-medium);
      cursor: pointer;
      -webkit-font-smoothing: antialiased;
      transition:
        transform var(--duration-fast) var(--ease-out-quart),
        background var(--duration-standard) var(--ease-out-quad),
        border-color var(--duration-standard) var(--ease-out-quad);
    }

    @media (hover: hover) and (pointer: fine) {
      .stack-btn:hover {
        background: var(--color-hover);
        border-color: var(--color-text-link);
      }
    }

    .setup {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    .setup-step {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .step-label {
      color: var(--color-text-secondary);
    }

    .file-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    .file-link {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      padding: 5px 10px;
      background: var(--color-hover);
      border: 1px solid var(--color-border);
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
      font-size: var(--font-size-12);
      color: var(--color-text-secondary);
      text-decoration: none;
      transition:
        color var(--duration-standard) var(--ease-out-quad),
        border-color var(--duration-standard) var(--ease-out-quad),
        background var(--duration-standard) var(--ease-out-quad);
    }

    @media (hover: hover) and (pointer: fine) {
      .file-link:hover {
        color: var(--color-text);
        border-color: var(--color-text-link);
      }
    }

    .code-block {
      padding: 12px 20px;
      background: var(--color-hover);
      border-radius: 8px;
      border: 1px solid var(--color-border);
      margin: 0;
      white-space: pre-wrap;
      overflow-wrap: break-word;
    }

    .code-block code {
      font-family: 'JetBrains Mono', monospace;
      font-size: var(--font-size-14);
      color: var(--color-text);
    }

    .docs {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .docs-heading {
      color: var(--color-text-secondary);
    }

    .docs-body {
      color: var(--color-text);
      text-wrap: pretty;
    }

    .docs-label {
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }

    .code-pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      align-items: start;
    }

    .code-pair-item {
      display: flex;
      flex-direction: column;
      gap: 0.625rem;
    }

    .code-pair-item .code-block {
      height: 100%;
    }

    @media (max-width: 600px) {
      .code-pair {
        grid-template-columns: 1fr;
      }
    }

    .inline-code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8em;
      background: var(--color-hover);
      border: 1px solid var(--color-border);
      border-radius: 4px;
      padding: 1px 5px;
    }

    .footer {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      color: var(--color-text-secondary);
      font-size: var(--font-size-14);
    }

    .footer a {
      color: var(--color-text-secondary);
      transition: color var(--duration-standard) var(--ease-out-quad);
    }

    .footer a:hover {
      color: var(--color-text);
    }

    @media (max-width: 600px) {
      .container {
        padding: 1.25rem;
        padding-top: 3.5rem;
      }

      .main {
        margin-top: 2.5rem;
        gap: 2.5rem;
      }

      .code-block code {
        font-size: var(--font-size-12);
      }
    }
  `]
})
export class AppComponent {
  private readonly toast = inject(KodonToast);

  private readonly messages: Record<Exclude<KodonToastVariant, 'loading'>, string[]> = {
    success: [
      'Changes saved successfully',
      'File uploaded',
      'Profile updated',
      'Payment completed',
      'Your invoice for October has been paid and a receipt is on its way to your inbox'
    ],
    error: [
      'Failed to save changes',
      'Network error occurred',
      'Permission denied',
      'Invalid credentials',
      'We couldn’t reach the server. Your changes are kept on this device until you’re back online'
    ],
    warning: [
      'Session expires in 5 minutes',
      'Storage almost full',
      'Unsaved changes detected',
      'Connection unstable',
      'You have unsaved changes in 2 documents. They will be lost if you close this tab'
    ],
    info: [
      'New version available',
      'Tip: Try keyboard shortcuts',
      'Processing your request...',
      '3 new notifications'
    ]
  };

  readonly placements: KodonToastPlacement[] = [
    'top-start',
    'top-center',
    'top-end',
    'bottom-start',
    'bottom-center',
    'bottom-end'
  ];
  readonly placement = signal<KodonToastPlacement>('bottom-end');

  private readonly injector = inject(Injector);
  private readonly code = viewChild<ElementRef<HTMLElement>>('code');

  constructor() {
    // The code block grows and shrinks to each new snippet instead of jumping.
    // Component effects run before the view updates, so this reads the old height.
    effect(() => {
      this.snippet();
      const el = this.code()?.nativeElement;
      if (!el) return;
      const from = el.offsetHeight;
      afterNextRender(
        () => {
          const to = el.offsetHeight;
          if (from === to || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
          el.animate([{ height: `${from}px` }, { height: `${to}px` }], {
            duration: 280,
            easing: 'cubic-bezier(0.165, 0.84, 0.44, 1)'
          });
        },
        { injector: this.injector }
      );
    });
  }
  private readonly lastCall = signal(`this.toast.success('Changes saved')`);

  readonly snippet = computed(() => {
    const placement = this.placement();
    const config =
      placement === 'bottom-end'
        ? 'provideKodonToast()'
        : `provideKodonToast({ placement: '${placement}' })`;
    return `// app.config.ts\n${config}\n\n// anywhere\n${this.lastCall()}`;
  });

  private pick<T>(list: T[]): T {
    return list[Math.floor(Math.random() * list.length)];
  }

  showToast(variant: Exclude<KodonToastVariant, 'loading'>): void {
    const message = this.pick(this.messages[variant]);
    this.toast.show({ message, variant, placement: this.placement() });
    this.lastCall.set(`this.toast.${variant}('${message.replace(/'/g, "\\'")}')`);
  }

  showPromise(): void {
    const fails = Math.random() < 0.3;
    const upload = new Promise<number>((resolve, reject) =>
      setTimeout(() => (fails ? reject(new Error('offline')) : resolve(3)), 1800)
    );
    this.toast.promise(
      upload,
      {
        loading: 'Uploading 3 photos…',
        success: n => `${n} photos uploaded`,
        error: 'Upload failed. Check your connection and try again.'
      },
      { placement: this.placement() }
    );
    this.lastCall.set(`this.toast.promise(upload(), {
  loading: 'Uploading 3 photos…',
  success: n => \`\${n} photos uploaded\`,
  error: 'Upload failed. Check your connection and try again.'
})`);
  }

  private syncStep = 0;

  showUpdate(): void {
    const steps: [KodonToastVariant, string][] = [
      ['loading', 'Syncing 12 files…'],
      ['info', '6 of 12 files synced'],
      ['success', 'All 12 files synced']
    ];
    const [variant, message] = steps[this.syncStep % steps.length];
    this.syncStep++;
    this.toast.show({ id: 'sync', variant, message, placement: this.placement() });
    this.lastCall.set(`// same id: the toast on screen changes, nothing stacks
this.toast.show({ id: 'sync', variant: '${variant}', message: '${message}' })`);
  }

  showStack(): void {
    const variants = ['success', 'error', 'warning', 'info'] as const;
    variants.forEach((variant, i) => {
      setTimeout(() => this.showToast(variant), i * 400);
    });
  }
}
