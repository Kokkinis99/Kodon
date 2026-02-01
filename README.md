# Kodon

**Sonner-style toast notifications for Angular**, built on [ng-primitives](https://angularprimitives.com/).

Smooth, interruptible animations that feel right. No keyframes—just CSS transitions that can be interrupted and retargeted mid-flight.

---

## Features

- 🎯 **Sonner-inspired animations** — Smooth stacking, hover expansion, swipe-to-dismiss
- 🔄 **Interruptible transitions** — CSS transitions that retarget smoothly when state changes
- 📱 **Swipe to dismiss** — With reversible fade & blur effects
- 🎨 **Fully customizable** — Colors, timing, and layout via CSS custom properties
- ♿ **Accessible** — Respects `prefers-reduced-motion`
- 📦 **Lightweight** — Just styles on top of ng-primitives

---

## Installation

```bash
npm install kodon ng-primitives
```

---

## Quick Start

### 1. Provide the toast config

```typescript
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideKodonToast } from 'kodon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKodonToast({
      placement: 'bottom-end',
      duration: 5000,
      maxToasts: 3
    })
  ]
};
```

### 2. Inject and use the toast service

```typescript
import { Component, inject } from '@angular/core';
import { KodonToast } from 'kodon';

@Component({
  selector: 'app-example',
  template: `<button (click)="showToast()">Show Toast</button>`
})
export class ExampleComponent {
  private toast = inject(KodonToast);

  showToast() {
    this.toast.success('Changes saved!');
  }
}
```

---

## API

### `KodonToast` Service

```typescript
// Show variants
toast.error('Something went wrong');
toast.success('Operation completed');
toast.warning('Please review');
toast.info('New updates available');

// With options
toast.show({
  message: 'Custom toast',
  variant: 'info',
  duration: 3000
});
```

### `provideKodonToast()` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placement` | `NgpToastPlacement` | `'bottom-end'` | Screen position |
| `duration` | `number` | `5000` | Auto-dismiss time (ms) |
| `maxToasts` | `number` | `3` | Max visible toasts |
| `gap` | `number` | `14` | Gap between expanded toasts (px) |
| `swipeDirections` | `('left'\|'right'\|'top'\|'bottom')[]` | `['right', 'bottom']` | Swipe dismiss directions |

---

## Customization

### CSS Custom Properties

Override in your global styles or a parent element:

```css
:root {
  /* Animation */
  --kodon-toast-duration: 350ms;
  --kodon-toast-easing: cubic-bezier(0.165, 0.84, 0.44, 1);
  
  /* Layout */
  --kodon-toast-peek: 11px;
  --kodon-toast-padding: 14px 16px;
  --kodon-toast-border-radius: 10px;
  --kodon-toast-max-width: 400px;
  
  /* Error variant */
  --kodon-toast-error-bg: hsl(0 84% 60% / 0.15);
  --kodon-toast-error-border: hsl(0 84% 60%);
  --kodon-toast-error-text: hsl(0 84% 80%);
  --kodon-toast-error-icon: hsl(0 84% 60%);
  
  /* Success variant */
  --kodon-toast-success-bg: hsl(142 76% 36% / 0.15);
  --kodon-toast-success-border: hsl(142 76% 46%);
  --kodon-toast-success-text: hsl(142 76% 66%);
  --kodon-toast-success-icon: hsl(142 76% 46%);
  
  /* Warning variant */
  --kodon-toast-warning-bg: hsl(38 92% 50% / 0.15);
  --kodon-toast-warning-border: hsl(38 92% 50%);
  --kodon-toast-warning-text: hsl(38 92% 70%);
  --kodon-toast-warning-icon: hsl(38 92% 50%);
  
  /* Info variant */
  --kodon-toast-info-bg: hsl(217 91% 60% / 0.15);
  --kodon-toast-info-border: hsl(217 91% 60%);
  --kodon-toast-info-text: hsl(217 91% 80%);
  --kodon-toast-info-icon: hsl(217 91% 60%);
}
```

### Custom Icons

Pass a template for custom icons:

```typescript
toast.show({
  message: 'Custom icon!',
  variant: 'info',
  icon: myIconTemplate
});
```

---

## How It Works

### Why Transitions Over Keyframes?

> "When adding multiple toasts, older ones jump into their new position instead of smoothly transitioning. That's one downside of keyframes—you can't smoothly change the end position while the animation is running. CSS transitions, on the other hand, can be **interrupted and retargeted**."
> — [Emil Kowalski](https://emilkowal.ski/ui/building-a-toast-component)

### Animation Techniques Used

1. **Child transforms** — Transforms on inner element prevent hover flicker
2. **Pseudo-element hover areas** — Invisible elements bridge gaps between toasts
3. **will-change** — Prevents GPU/CPU swap jitter
4. **Unit stripping in CSS** — `calc(var(--px-value) / 1px)` for unitless math
5. **Dead zones** — Swipe effects don't trigger immediately for intentional feel

---

## Credits

- Animation approach inspired by [Sonner](https://sonner.emilkowal.ski/) by Emil Kowalski
- Built on [ng-primitives](https://angularprimitives.com/) for headless toast behavior

---

## License

MIT © Covve
