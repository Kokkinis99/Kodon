import { InjectionToken, Provider } from '@angular/core';

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
  placement: KodonToastPlacement;

  /**
   * Auto-dismiss duration in milliseconds. Set to 0 to disable.
   * @default 4000
   */
  duration: number;

  /**
   * Gap between toasts in pixels.
   * @default 12
   */
  gap: number;
}

const defaultConfig: KodonToastConfig = {
  placement: 'bottom-end',
  duration: 4000,
  gap: 12
};

export const KODON_TOAST_CONFIG = new InjectionToken<KodonToastConfig>(
  'KodonToastConfig',
  { providedIn: 'root', factory: () => defaultConfig }
);

/**
 * Provide Kodon toast configuration for your application.
 *
 * @example
 * // app.config.ts
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     provideKodonToast({
 *       placement: 'bottom-end',
 *       duration: 5000
 *     })
 *   ]
 * };
 */
export function provideKodonToast(
  config: Partial<KodonToastConfig> = {}
): Provider[] {
  return [
    {
      provide: KODON_TOAST_CONFIG,
      useValue: { ...defaultConfig, ...config }
    }
  ];
}
