import { Provider } from '@angular/core';
import { provideToastConfig } from 'ng-primitives/toast';

export type KodonToastPlacement =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

type SwipeDirection = 'top' | 'right' | 'bottom' | 'left';

/**
 * Get allowed swipe directions based on placement.
 * Toasts can only be swiped toward screen edges.
 */
function getSwipeDirections(placement: KodonToastPlacement): SwipeDirection[] {
  const map: Record<KodonToastPlacement, SwipeDirection[]> = {
    'top-start': ['top', 'left'],
    'top-center': ['top'],
    'top-end': ['top', 'right'],
    'bottom-start': ['bottom', 'left'],
    'bottom-center': ['bottom'],
    'bottom-end': ['bottom', 'right']
  };
  return map[placement];
}

export interface KodonToastConfig {
  /**
   * Where toasts appear on screen.
   * Swipe directions are auto-calculated (toward screen edges only).
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
 *       maxToasts: 3
 *     })
 *   ]
 * };
 */
export function provideKodonToast(config: KodonToastConfig = {}): Provider[] {
  const placement = config.placement ?? 'bottom-end';

  return [
    provideToastConfig({
      placement,
      duration: config.duration ?? 5000,
      maxToasts: config.maxToasts ?? 3,
      gap: config.gap ?? 14,
      swipeThreshold: config.swipeThreshold ?? 100,
      swipeDirections: getSwipeDirections(placement)
    })
  ];
}
