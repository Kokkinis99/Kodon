/*
 * Public API Surface of kodon
 */

// Component
export {
  KodonToastComponent,
  KodonToastVariant,
  KodonToastContext,
  KodonToastState,
  KodonToastExit
} from './lib/toast.component';

// Service
export {
  KodonToast,
  KodonToastOptions,
  KodonToastExtras,
  KodonToastHandle,
  KodonToastPromiseMessages
} from './lib/toast.service';

// Provider
export {
  provideKodonToast,
  KodonToastConfig,
  KodonToastPlacement,
  getSwipeDirections
} from './lib/provide-toast';
