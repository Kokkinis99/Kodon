import {
  computed,
  effect,
  inject,
  Injectable,
  Injector,
  Resource,
  ResourceStatus,
  Signal,
  signal,
  TemplateRef,
  untracked,
  WritableSignal
} from '@angular/core';
import { isObservable, lastValueFrom, Observable } from 'rxjs';
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
  /**
   * Toasts in the same group collapse into one: the newest message replaces the old one,
   * a count shows how many arrived, and the countdown starts over. Identical toasts
   * (same message and variant) group on their own unless provideKodonToast turns
   * groupDuplicates off. Pass false to always stack this one.
   */
  group?: string | false;
  /**
   * Progress from 0 to 1, drawn as a bar along the bottom of the toast. It follows the
   * signal as it changes; undefined hides the bar.
   */
  progress?: Signal<number | undefined>;
}

/** Everything but the message and variant, for the shorthand methods. */
export type KodonToastExtras = Omit<KodonToastOptions, 'message' | 'variant'>;

export interface KodonToastHandle {
  id: string;
  dismiss(): void;
}

export interface KodonToastResourceMessages<T> {
  /** Shown while the resource loads. Leave it out to stay quiet until it settles. */
  loading?: string;
  /** Shown when it resolves. Leave it out to only hear about errors. */
  success?: string | ((value: T) => string);
  error?: string | ((error: unknown) => string);
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
  group?: string;
}

/** ng-primitives' timer is a plain setTimeout, which fires at once for Infinity. */
const FOREVER = 2_147_483_647;

let nextId = 0;

@Injectable({ providedIn: 'root' })
export class KodonToast {
  private readonly _toastManager = inject(NgpToastManager);
  private readonly _defaults = inject(KODON_TOAST_DEFAULTS);
  private readonly _injector = inject(Injector);
  private readonly _entries = new Map<string, Entry>();
  /** The toast on screen for each group. */
  private readonly _groups = new Map<string, string>();

  show(options: KodonToastOptions): KodonToastHandle {
    const variant = options.variant ?? 'info';
    const group = this._groupOf(options, variant);
    const id = options.id ?? (group !== undefined ? this._groups.get(group) : undefined) ?? `kodon-${++nextId}`;
    const state: KodonToastState = {
      message: options.message,
      variant,
      icon: options.icon,
      duration: options.duration ?? (variant === 'loading' ? Infinity : this._defaults.duration),
      count: 1,
      progress: options.progress
    };

    // A toast on its way out can't be updated; a new one takes its place.
    const existing = this._entries.get(id);
    if (existing && !existing.component?.exiting) {
      const grouped = options.id === undefined && group !== undefined;
      existing.state.set({ ...state, count: grouped ? existing.state().count + 1 : 1 });
      existing.component?.onUpdated(grouped);
      return this._handle(id);
    }

    const entry: Entry = { state: signal(state), ref: null!, component: null, group };
    const context: KodonToastContext = {
      id,
      state: entry.state.asReadonly(),
      register: component => {
        entry.component = component;
        if (!component) this._forget(id, entry);
      }
    };
    this._entries.set(id, entry);
    if (group !== undefined) this._groups.set(group, id);

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
   *
   * An Observable works too, such as an HttpClient call. Kōdon subscribes to it and
   * settles on its last value, so don't subscribe again yourself: use unwrap() for the
   * result.
   */
  promise<T>(
    promise: Promise<T> | (() => Promise<T>) | Observable<T>,
    messages: KodonToastPromiseMessages<T>,
    extras?: KodonToastExtras
  ): KodonToastHandle & { unwrap(): Promise<T> } {
    const handle = this.loading(messages.loading, { ...extras, duration: Infinity });
    const settle = (variant: 'success' | 'error', message: string) => {
      if (!this._entries.has(handle.id)) return;
      this.show({ ...extras, id: handle.id, message, variant });
    };

    const source = isObservable(promise)
      ? lastValueFrom(promise, { defaultValue: undefined as T })
      : typeof promise === 'function'
        ? promise()
        : promise;
    const result = source.then(
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

  /**
   * Follows a resource() or httpResource(): a loading toast while it loads, turning into a
   * success or an error when it settles, and again on every reload. Each message is
   * optional, so `{ error: 'Could not load' }` only speaks up when something fails. An
   * httpResource made with reportProgress shows its upload or download progress.
   *
   * Call it in an injection context (a field initializer or constructor) and it stops with
   * that component; elsewhere pass an injector, or call stop().
   *
   * @example
   * readonly profile = httpResource<Profile>(() => `/api/users/${this.id()}`);
   * constructor() {
   *   inject(KodonToast).resource(this.profile, { error: 'Could not load the profile' });
   * }
   */
  resource<T>(
    resource: Resource<T>,
    messages: KodonToastResourceMessages<T>,
    extras?: KodonToastExtras & { injector?: Injector }
  ): KodonToastHandle & { stop(): void } {
    const { injector, ...options } = extras ?? {};
    const handle = this._handle(options.id ?? `kodon-${++nextId}`);
    const progress = this._progressOf(resource);
    let last: ResourceStatus | undefined;
    let loadingShown = false;

    const ref = effect(
      () => {
        const status = resource.status();
        if (status === last) return;
        last = status;
        untracked(() => {
          if (status === 'loading' || status === 'reloading') {
            loadingShown = messages.loading !== undefined;
            if (loadingShown) {
              this.show({ ...options, id: handle.id, message: messages.loading!, variant: 'loading', progress });
            }
            return;
          }
          // Closed while it loaded: it stays closed.
          const closed = loadingShown && !this._entries.has(handle.id);
          const wasLoading = loadingShown;
          loadingShown = false;
          if (closed) return;

          const message =
            status === 'resolved'
              ? this._message(messages.success, resource.value())
              : status === 'error'
                ? this._message(messages.error, resource.error())
                : undefined;
          if (message !== undefined) {
            const variant = status === 'resolved' ? 'success' : 'error';
            this.show({ ...options, id: handle.id, message, variant, group: false });
          } else if (wasLoading) {
            this.dismiss(handle.id);
          }
        });
      },
      { injector: injector ?? this._callerInjector() }
    );

    return { ...handle, stop: () => ref.destroy() };
  }

  /** Dismisses the toast with this id, or every toast when called without one. */
  dismiss(id?: string): void {
    const ids = id === undefined ? [...this._entries.keys()] : [id];
    for (const key of ids) {
      const entry = this._entries.get(key);
      if (!entry) continue;
      this._forget(key, entry);
      if (entry.component) entry.component.dismiss();
      else entry.ref.dismiss();
    }
  }

  private _forget(id: string, entry: Entry): void {
    if (this._entries.get(id) === entry) this._entries.delete(id);
    if (entry.group !== undefined && this._groups.get(entry.group) === id) this._groups.delete(entry.group);
  }

  /** The group a toast joins, if any. Loading toasts never group on their own. */
  private _groupOf(options: KodonToastOptions, variant: KodonToastVariant): string | undefined {
    if (options.group === false) return undefined;
    if (options.group !== undefined) return `group:${options.group}`;
    if (!this._defaults.groupDuplicates || variant === 'loading' || options.progress) return undefined;
    return `same:${variant}:${options.message}`;
  }

  /** An httpResource made with reportProgress carries a progress signal. */
  private _progressOf(resource: Resource<unknown>): Signal<number | undefined> | undefined {
    const events = (resource as { progress?: Signal<{ loaded: number; total?: number } | undefined> }).progress;
    if (typeof events !== 'function') return undefined;
    return computed(() => {
      const event = events();
      return event?.total ? event.loaded / event.total : undefined;
    });
  }

  private _message<V>(message: string | ((value: V) => string) | undefined, value: V): string | undefined {
    return typeof message === 'function' ? message(value) : message;
  }

  /** The caller's injector when called in an injection context, so effects stop with it. */
  private _callerInjector(): Injector {
    try {
      return inject(Injector);
    } catch {
      return this._injector;
    }
  }

  private _handle(id: string): KodonToastHandle {
    return { id, dismiss: () => this.dismiss(id) };
  }

  private _extras(extras?: number | KodonToastExtras): KodonToastExtras {
    return typeof extras === 'number' ? { duration: extras } : (extras ?? {});
  }
}
