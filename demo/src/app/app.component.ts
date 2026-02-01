import { Component, inject } from '@angular/core';
import { KodonToast } from '../../../src/lib/toast.service';
import { KodonToastVariant } from '../../../src/lib/toast.component';
import {
  LucideAngularModule,
  CircleCheck,
  CircleX,
  TriangleAlert,
  Info,
  Layers,
  Sparkles,
  Hand,
  Library
} from 'lucide-angular';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LucideAngularModule],
  template: `
    <main class="container">
      <header class="hero">
        <div class="badge">Angular 19 • ng-primitives</div>
        <h1 class="title">
          <span class="gradient">Kodon</span>
        </h1>
        <p class="subtitle">
          Sonner-style toast notifications for Angular.<br>
          Smooth animations. Swipe to dismiss. Stackable.
        </p>
      </header>

      <section class="demo-section">
        <div class="button-grid">
          <button class="toast-btn success" (click)="showToast('success')">
            <lucide-icon [img]="CircleCheck" [size]="18" [strokeWidth]="2.5" />
            <span class="btn-label">Success</span>
          </button>
          <button class="toast-btn error" (click)="showToast('error')">
            <lucide-icon [img]="CircleX" [size]="18" [strokeWidth]="2.5" />
            <span class="btn-label">Error</span>
          </button>
          <button class="toast-btn warning" (click)="showToast('warning')">
            <lucide-icon [img]="TriangleAlert" [size]="18" [strokeWidth]="2.5" />
            <span class="btn-label">Warning</span>
          </button>
          <button class="toast-btn info" (click)="showToast('info')">
            <lucide-icon [img]="Info" [size]="18" [strokeWidth]="2.5" />
            <span class="btn-label">Info</span>
          </button>
        </div>

        <button class="stack-btn" (click)="showStack()">
          <lucide-icon [img]="Layers" [size]="18" [strokeWidth]="2" />
          Stack Multiple
        </button>
      </section>

      <section class="features">
        <div class="feature">
          <lucide-icon class="feature-icon" [img]="Sparkles" [size]="28" [strokeWidth]="1.5" />
          <h3>Sonner-style Animations</h3>
          <p>Smooth CSS transitions that can be interrupted</p>
        </div>
        <div class="feature">
          <lucide-icon class="feature-icon" [img]="Hand" [size]="28" [strokeWidth]="1.5" />
          <h3>Swipe to Dismiss</h3>
          <p>Natural gesture support on touch devices</p>
        </div>
        <div class="feature">
          <lucide-icon class="feature-icon" [img]="Library" [size]="28" [strokeWidth]="1.5" />
          <h3>Stackable</h3>
          <p>Hover to expand and see all toasts</p>
        </div>
      </section>

      <section class="install">
        <h2>Installation</h2>
        <pre class="code-block"><code>npm install kodon</code></pre>
      </section>

      <footer class="footer">
        <a
          href="https://github.com/Kokkinis99/kodon"
          target="_blank"
          rel="noopener"
        >
          GitHub
        </a>
        <span class="divider">•</span>
        <span>Made by George Kokkiinis</span>
      </footer>
    </main>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 48px 24px 80px;
    }

    .hero {
      text-align: center;
      margin-bottom: 64px;
    }

    .badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 100px;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.2);
      color: var(--accent);
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 24px;
    }

    .title {
      font-size: clamp(3rem, 10vw, 5rem);
      font-weight: 700;
      margin: 0 0 16px;
      letter-spacing: -0.03em;
    }

    .gradient {
      background: linear-gradient(
        135deg,
        #f4f4f5 0%,
        #8b5cf6 50%,
        #ec4899 100%
      );
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      font-size: 1.2rem;
      color: var(--text-secondary);
      line-height: 1.7;
      margin: 0;
    }

    .demo-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      margin-bottom: 80px;
    }

    .button-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      width: 100%;
      max-width: 400px;
    }

    .toast-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 16px 24px;
      border: none;
      border-radius: 12px;
      font-family: inherit;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .toast-btn:hover {
      transform: translateY(-2px);
    }

    .toast-btn:active {
      transform: translateY(0);
    }

    .toast-btn lucide-icon {
      flex-shrink: 0;
    }

    .toast-btn.success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.3);
    }

    .toast-btn.error {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.3);
    }

    .toast-btn.warning {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      color: white;
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3);
    }

    .toast-btn.info {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
    }

    .stack-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 28px;
      background: var(--bg-card);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      color: var(--text-primary);
      font-family: inherit;
      font-size: 15px;
      font-weight: 500;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
    }

    .stack-btn:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.2);
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 24px;
      margin-bottom: 80px;
    }

    .feature {
      padding: 24px;
      background: var(--bg-card);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .feature-icon {
      display: block;
      margin-bottom: 12px;
      color: var(--accent);
    }

    .feature h3 {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
    }

    .feature p {
      margin: 0;
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .install {
      text-align: center;
      margin-bottom: 64px;
    }

    .install h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0 0 16px;
    }

    .code-block {
      display: inline-block;
      padding: 16px 28px;
      background: var(--bg-secondary);
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      margin: 0;
    }

    .code-block code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 14px;
      color: #e879f9;
    }

    .footer {
      text-align: center;
      color: var(--text-secondary);
      font-size: 14px;
    }

    .footer a {
      color: var(--text-primary);
      text-decoration: none;
      transition: color 0.2s;
    }

    .footer a:hover {
      color: var(--accent);
    }

    .divider {
      margin: 0 12px;
      opacity: 0.5;
    }
  `]
})
export class AppComponent {
  private readonly toast = inject(KodonToast);

  // Lucide icons
  protected readonly CircleCheck = CircleCheck;
  protected readonly CircleX = CircleX;
  protected readonly TriangleAlert = TriangleAlert;
  protected readonly Info = Info;
  protected readonly Layers = Layers;
  protected readonly Sparkles = Sparkles;
  protected readonly Hand = Hand;
  protected readonly Library = Library;

  private readonly messages: Record<KodonToastVariant, string[]> = {
    success: [
      'Changes saved successfully',
      'File uploaded',
      'Profile updated',
      'Payment completed'
    ],
    error: [
      'Failed to save changes',
      'Network error occurred',
      'Permission denied',
      'Invalid credentials'
    ],
    warning: [
      'Session expires in 5 minutes',
      'Storage almost full',
      'Unsaved changes detected',
      'Connection unstable'
    ],
    info: [
      'New version available',
      'Tip: Try keyboard shortcuts',
      'Processing your request...',
      '3 new notifications'
    ]
  };

  showToast(variant: KodonToastVariant): void {
    const msgs = this.messages[variant];
    const message = msgs[Math.floor(Math.random() * msgs.length)];
    this.toast[variant](message);
  }

  showStack(): void {
    const variants: KodonToastVariant[] = ['info', 'success', 'warning'];
    variants.forEach((variant, i) => {
      setTimeout(() => this.showToast(variant), i * 400);
    });
  }
}
