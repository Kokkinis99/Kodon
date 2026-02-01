import {
  ChangeDetectionStrategy,
  Component,
  inject,
  TemplateRef
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { NgpToast, NgpToastManager, injectToastContext } from 'ng-primitives/toast';

export type KodonToastVariant = 'error' | 'success' | 'info' | 'warning';

export interface KodonToastContext {
  message: string;
  variant: KodonToastVariant;
  icon?: TemplateRef<unknown>;
}

/**
 * Toast component following Sonner-style animations.
 * Uses CSS transitions with @starting-style for smooth enter animations.
 * @see https://emilkowal.ski/ui/building-a-toast-component
 */
@Component({
  selector: 'kodon-toast',
  standalone: true,
  imports: [NgTemplateOutlet],
  hostDirectives: [NgpToast],
  host: {
    '[attr.data-variant]': 'context.variant'
  },
  template: `
    <div class="kodon-toast-content">
      @if (context.icon) {
        <ng-container *ngTemplateOutlet="context.icon" />
      } @else {
        <svg class="kodon-toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          @switch (context.variant) {
            @case ('error') {
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            }
            @case ('success') {
              <circle cx="12" cy="12" r="10"/>
              <polyline points="9 12 11 14 15 10"/>
            }
            @case ('warning') {
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            }
            @case ('info') {
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            }
          }
        </svg>
      }
      <span class="kodon-toast-message">{{ context.message }}</span>
      <button
        type="button"
        class="kodon-toast-close"
        (click)="dismiss()"
        aria-label="Dismiss toast"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  `,
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KodonToastComponent {
  private readonly _toastManager = inject(NgpToastManager);
  private readonly _ngpToast = inject(NgpToast);

  public readonly context = injectToastContext<KodonToastContext>();

  public dismiss(): void {
    this._toastManager.dismiss(this._ngpToast);
  }
}
