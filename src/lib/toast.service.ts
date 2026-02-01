import {
  Injectable,
  ApplicationRef,
  createComponent,
  EnvironmentInjector,
  inject,
  signal,
  computed,
  TemplateRef
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { KodonToastComponent, KodonToastVariant } from './toast.component';
import { KODON_TOAST_CONFIG, KodonToastConfig } from './provide-toast';

export interface KodonToastOptions {
  message: string;
  variant?: KodonToastVariant;
  duration?: number;
  icon?: TemplateRef<unknown>;
}

export interface ToastState {
  id: number;
  message: string;
  variant: KodonToastVariant;
  icon?: TemplateRef<unknown>;
}

/**
 * Service for showing Sonner-style toast notifications.
 *
 * @example
 * toast.success('Changes saved!');
 * toast.error('Something went wrong');
 */
const DEFAULT_CONFIG: KodonToastConfig = {
  placement: 'bottom-end',
  duration: 4000,
  gap: 12
};

@Injectable({ providedIn: 'root' })
export class KodonToast {
  private readonly _config = inject(KODON_TOAST_CONFIG, { optional: true })
    ?? DEFAULT_CONFIG;
  private readonly _appRef = inject(ApplicationRef);
  private readonly _injector = inject(EnvironmentInjector);
  private readonly _document = inject(DOCUMENT);

  private _nextId = 0;
  private _containerEl: HTMLElement | null = null;
  private readonly _toasts = signal<ToastState[]>([]);

  readonly toasts = computed(() => this._toasts());

  /**
   * Show a toast with full configuration options.
   */
  show(options: KodonToastOptions): number {
    const id = this._nextId++;
    const toast: ToastState = {
      id,
      message: options.message,
      variant: options.variant ?? 'info',
      icon: options.icon
    };

    this._toasts.update(toasts => [...toasts, toast]);
    this._ensureContainer();
    this._renderToast(toast, options.duration);

    return id;
  }

  /**
   * Show a success toast.
   */
  success(message: string, duration?: number): number {
    return this.show({ message, variant: 'success', duration });
  }

  /**
   * Show an error toast.
   */
  error(message: string, duration?: number): number {
    return this.show({ message, variant: 'error', duration });
  }

  /**
   * Show a warning toast.
   */
  warning(message: string, duration?: number): number {
    return this.show({ message, variant: 'warning', duration });
  }

  /**
   * Show an info toast.
   */
  info(message: string, duration?: number): number {
    return this.show({ message, variant: 'info', duration });
  }

  /**
   * Dismiss a specific toast by ID.
   */
  dismiss(id: number): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  /**
   * Dismiss all toasts.
   */
  dismissAll(): void {
    this._toasts.set([]);
  }

  private _ensureContainer(): void {
    if (this._containerEl) return;

    this._containerEl = this._document.createElement('div');
    this._containerEl.className = 'kodon-toast-container';
    this._containerEl.setAttribute('data-position', this._config.placement);
    this._document.body.appendChild(this._containerEl);
  }

  private _renderToast(toast: ToastState, customDuration?: number): void {
    if (!this._containerEl) return;

    const componentRef = createComponent(KodonToastComponent, {
      environmentInjector: this._injector,
      hostElement: this._document.createElement('div')
    });

    componentRef.setInput('id', toast.id);
    componentRef.setInput('message', toast.message);
    componentRef.setInput('variant', toast.variant);
    componentRef.setInput('icon', toast.icon);

    const hostEl = componentRef.location.nativeElement as HTMLElement;
    this._containerEl.appendChild(hostEl);
    this._appRef.attachView(componentRef.hostView);

    const duration = customDuration ?? this._config.duration;
    if (duration > 0) {
      setTimeout(() => {
        this._removeToast(toast.id, hostEl, componentRef);
      }, duration);
    }

    // Subscribe to dismiss event from component
    componentRef.instance.dismissed.subscribe(() => {
      this._removeToast(toast.id, hostEl, componentRef);
    });
  }

  private _removeToast(
    id: number,
    hostEl: HTMLElement,
    componentRef: ReturnType<typeof createComponent>
  ): void {
    hostEl.setAttribute('data-removing', 'true');
    
    setTimeout(() => {
      this._appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      hostEl.remove();
      this.dismiss(id);
    }, 350);
  }
}
