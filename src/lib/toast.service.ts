import { inject, Injectable, TemplateRef } from '@angular/core';
import { NgpToastManager, NgpToastRef } from 'ng-primitives/toast';
import {
  KodonToastComponent,
  KodonToastVariant,
  KodonToastContext
} from './toast.component';

export interface KodonToastOptions {
  message: string;
  variant?: KodonToastVariant;
  duration?: number;
  icon?: TemplateRef<unknown>;
}

/**
 * Service for showing Sonner-style toast notifications.
 * Uses ng-primitives toast manager with smooth CSS transitions.
 *
 * @example
 * toast.error('Failed to save changes');
 * toast.success('Changes saved!');
 */
@Injectable({ providedIn: 'root' })
export class KodonToast {
  private readonly _toastManager = inject(NgpToastManager);

  /**
   * Show a toast with full configuration options.
   */
  show(options: KodonToastOptions): NgpToastRef {
    const context: KodonToastContext = {
      message: options.message,
      variant: options.variant ?? 'info',
      icon: options.icon
    };

    return this._toastManager.show(KodonToastComponent, {
      context,
      duration: options.duration
    });
  }

  /**
   * Show an error toast.
   */
  error(message: string, duration?: number): NgpToastRef {
    return this.show({ message, variant: 'error', duration });
  }

  /**
   * Show a success toast.
   */
  success(message: string, duration?: number): NgpToastRef {
    return this.show({ message, variant: 'success', duration });
  }

  /**
   * Show a warning toast.
   */
  warning(message: string, duration?: number): NgpToastRef {
    return this.show({ message, variant: 'warning', duration });
  }

  /**
   * Show an info toast.
   */
  info(message: string, duration?: number): NgpToastRef {
    return this.show({ message, variant: 'info', duration });
  }
}
