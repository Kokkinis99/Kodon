import { Provider } from '@angular/core';
import { provideToastConfig } from 'ng-primitives/toast';

export type KodonToastPlacement =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

export type KodonSwipeDirection = 'top' | 'right' | 'bottom' | 'left';

export interface KodonToastConfig {
  /**
   * Where toasts appear on screen.
   * @default 'bottom-end'
   */
  placement?: KodonToastPlacement;

  /**
   * Auto-dismiss duration in milliseconds.
   * @default 5000
   */
  duration?: number;

  /**
   * Maximum number of visible toasts.
   * @default 3
   */
  maxToasts?: number;

  /**
   * Gap between expanded toasts in pixels.
   * @default 14
   */
  gap?: number;

  /**
   * Distance in pixels required to dismiss via swipe.
   * @default 100
   */
  swipeThreshold?: number;

  /**
   * Allowed swipe directions for dismissal.
   * @default ['right', 'bottom']
   */
  swipeDirections?: KodonSwipeDirection[];
}

/**
 * Provide Kodon toast configuration for your application.
 *
 * @example
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideKodonToast({
 *       placement: 'bottom-end',
 *       duration: 5000,
 *       maxToasts: 3,
 *       swipeThreshold: 100
 *     })
 *   ]
 * };
 */
export function provideKodonToast(config: KodonToastConfig = {}): Provider[] {
  return [
    provideToastConfig({
      placement: config.placement ?? 'bottom-end',
      duration: config.duration ?? 5000,
      maxToasts: config.maxToasts ?? 3,
      gap: config.gap ?? 14,
      swipeThreshold: config.swipeThreshold ?? 100,
      swipeDirections: config.swipeDirections ?? ['right', 'bottom']
    })
  ];
}
