import {
  ChangeDetectionStrategy,
  Component,
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
export class KodonToastComponent {
  private readonly _toastManager = inject(NgpToastManager);
  private readonly _ngpToast = inject(NgpToast);

  public readonly context = injectToastContext<KodonToastContext>();

  // Lucide icons
  protected readonly CircleX = CircleX;
  protected readonly CircleCheck = CircleCheck;
  protected readonly TriangleAlert = TriangleAlert;
  protected readonly Info = Info;
  protected readonly X = X;

  public dismiss(): void {
    this._toastManager.dismiss(this._ngpToast);
  }
}
