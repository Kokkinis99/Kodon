import { Provider } from '@angular/core';
import { provideToastConfig } from 'ng-primitives/toast';

export type KodonToastPlacement =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

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
  return [
    provideToastConfig({
      placement: config.placement ?? 'bottom-end',
      duration: config.duration ?? 5000,
      maxToasts: config.maxToasts ?? 3,
      gap: config.gap ?? 14
    })
  ];
}
