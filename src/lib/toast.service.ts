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
 * // Show error toast
 * toast.error('Failed to save changes');
 *
 * // Show with custom options
 * toast.show({ message: 'Done!', variant: 'success' });
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
   * @param message - The error message to display
   * @param duration - Auto-dismiss duration in ms (default from config)
   */
  error(message: string, duration?: number): NgpToastRef {
    return this.show({ message, variant: 'error', duration });
  }

  /**
   * Show a success toast.
   * @param message - The success message to display
   * @param duration - Auto-dismiss duration in ms (default from config)
   */
  success(message: string, duration?: number): NgpToastRef {
    return this.show({ message, variant: 'success', duration });
  }

  /**
   * Show a warning toast.
   * @param message - The warning message to display
   * @param duration - Auto-dismiss duration in ms (default from config)
   */
  warning(message: string, duration?: number): NgpToastRef {
    return this.show({ message, variant: 'warning', duration });
  }

  /**
   * Show an info toast.
   * @param message - The info message to display
   * @param duration - Auto-dismiss duration in ms (default from config)
   */
  info(message: string, duration?: number): NgpToastRef {
    return this.show({ message, variant: 'info', duration });
  }
}
