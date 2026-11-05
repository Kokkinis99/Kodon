import { inject, Injectable, signal, TemplateRef, WritableSignal } from '@angular/core';
import { NgpToastManager, NgpToastRef } from 'ng-primitives/toast';
import {
  KodonToastComponent,
  KodonToastContext,
  KodonToastState,
  KodonToastVariant
} from './toast.component';
import {
  KODON_TOAST_DEFAULTS,
  KodonToastPlacement,
  getSwipeDirections
} from './provide-toast';

export interface KodonToastOptions {
  message: string;
  variant?: KodonToastVariant;
  /** Milliseconds before it closes itself. Infinity keeps it until dismissed. */
  duration?: number;
  icon?: TemplateRef<unknown>;
  /**
   * Show a toast with an id that's already on screen and that toast changes in place
   * instead of a new one stacking on top. Its countdown starts over.
   */
  id?: string;
  /** Overrides the placement from provideKodonToast for this toast. */
  placement?: KodonToastPlacement;
}

/** Everything but the message and variant, for the shorthand methods. */
export type KodonToastExtras = Omit<KodonToastOptions, 'message' | 'variant'>;

export interface KodonToastHandle {
  id: string;
  dismiss(): void;
}

export interface KodonToastPromiseMessages<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((error: unknown) => string);
}

interface Entry {
  state: WritableSignal<KodonToastState>;
  ref: NgpToastRef;
  component: KodonToastComponent | null;
}

/** ng-primitives' timer is a plain setTimeout, which fires at once for Infinity. */
const FOREVER = 2_147_483_647;

let nextId = 0;

@Injectable({ providedIn: 'root' })
export class KodonToast {
  private readonly _toastManager = inject(NgpToastManager);
  private readonly _defaults = inject(KODON_TOAST_DEFAULTS);
  private readonly _entries = new Map<string, Entry>();

  show(options: KodonToastOptions): KodonToastHandle {
    const id = options.id ?? `kodon-${++nextId}`;
    const variant = options.variant ?? 'info';
    const state: KodonToastState = {
      message: options.message,
      variant,
      icon: options.icon,
      duration: options.duration ?? (variant === 'loading' ? Infinity : this._defaults.duration)
    };

    const existing = this._entries.get(id);
    if (existing) {
      existing.state.set(state);
      existing.component?.onUpdated();
      return this._handle(id);
    }

    const entry: Entry = { state: signal(state), ref: null!, component: null };
    const context: KodonToastContext = {
      id,
      state: entry.state.asReadonly(),
      register: component => {
        entry.component = component;
        if (!component && this._entries.get(id) === entry) this._entries.delete(id);
      }
    };
    this._entries.set(id, entry);

    const placement = options.placement ?? this._defaults.placement;
    entry.ref = this._toastManager.show(KodonToastComponent, {
      context,
      placement,
      swipeDirections: getSwipeDirections(placement),
      duration: Number.isFinite(state.duration) ? state.duration : FOREVER
    });
    return this._handle(id);
  }

  error(message: string, extras?: number | KodonToastExtras): KodonToastHandle {
    return this.show({ ...this._extras(extras), message, variant: 'error' });
  }

  success(message: string, extras?: number | KodonToastExtras): KodonToastHandle {
    return this.show({ ...this._extras(extras), message, variant: 'success' });
  }

  warning(message: string, extras?: number | KodonToastExtras): KodonToastHandle {
    return this.show({ ...this._extras(extras), message, variant: 'warning' });
  }

  info(message: string, extras?: number | KodonToastExtras): KodonToastHandle {
    return this.show({ ...this._extras(extras), message, variant: 'info' });
  }

  /** A toast with a spinner that stays until you update it by id or dismiss it. */
  loading(message: string, extras?: KodonToastExtras): KodonToastHandle {
    return this.show({ ...extras, message, variant: 'loading' });
  }

  /**
   * Shows a loading toast, then turns that same toast into a success or an error when the
   * promise settles. If someone closes it while it's loading, it stays closed.
   *
   * @example
   * this.toast.promise(this.api.save(draft), {
   *   loading: 'Saving…',
   *   success: post => `Published “${post.title}”`,
   *   error: 'Could not save'
   * });
   */
  promise<T>(
    promise: Promise<T> | (() => Promise<T>),
    messages: KodonToastPromiseMessages<T>,
    extras?: KodonToastExtras
  ): KodonToastHandle & { unwrap(): Promise<T> } {
    const handle = this.loading(messages.loading, { ...extras, duration: Infinity });
    const settle = (variant: 'success' | 'error', message: string) => {
      if (!this._entries.has(handle.id)) return;
      this.show({ ...extras, id: handle.id, message, variant });
    };

    const result = (typeof promise === 'function' ? promise() : promise).then(
      data => {
        settle('success', typeof messages.success === 'function' ? messages.success(data) : messages.success);
        return data;
      },
      error => {
        settle('error', typeof messages.error === 'function' ? messages.error(error) : messages.error);
        throw error;
      }
    );
    // The toast already reports the failure; callers who care use unwrap().
    result.catch(() => {});

    return { ...handle, unwrap: () => result };
  }

  /** Dismisses the toast with this id, or every toast when called without one. */
  dismiss(id?: string): void {
    const ids = id === undefined ? [...this._entries.keys()] : [id];
    for (const key of ids) {
      const entry = this._entries.get(key);
      if (!entry) continue;
      this._entries.delete(key);
      if (entry.component) entry.component.dismiss();
      else entry.ref.dismiss();
    }
  }

  private _handle(id: string): KodonToastHandle {
    return { id, dismiss: () => this.dismiss(id) };
  }

  private _extras(extras?: number | KodonToastExtras): KodonToastExtras {
    return typeof extras === 'number' ? { duration: extras } : (extras ?? {});
  }
}
