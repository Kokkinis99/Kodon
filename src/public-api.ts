/*
 * Public API Surface of kodon
 */

// Component
export { KodonToastComponent, KodonToastVariant } from './lib/toast.component';

// Service
export { KodonToast, KodonToastOptions, ToastState } from './lib/toast.service';

// Provider
export {
  provideKodonToast,
  KodonToastConfig,
  KodonToastPlacement,
  KODON_TOAST_CONFIG
} from './lib/provide-toast';
