# Kodon

**Sonner-style toast notifications for Angular.**

Smooth, interruptible animations using CSS `@starting-style`. No dependencies beyond Angular.

---

## Features

- 🎯 **Sonner-inspired animations** — Smooth enter/exit transitions
- ✨ **CSS @starting-style** — Modern enter animations, no JavaScript timing hacks
- 🎨 **Fully customizable** — Colors, timing, and layout via CSS custom properties
- ♿ **Accessible** — Respects `prefers-reduced-motion`
- 📦 **Zero dependencies** — Just Angular

---

## Installation

```bash
npm install kodon
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
      duration: 4000
    })
  ]
};
```

### 2. Import the styles

```scss
// styles.scss
@use 'kodon/toast-visuals';
@use 'kodon/toast-container';
```

### 3. Use the toast service

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

// Dismiss
toast.dismiss(toastId);
toast.dismissAll();
```

### `provideKodonToast()` Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `placement` | `KodonToastPlacement` | `'bottom-end'` | Screen position |
| `duration` | `number` | `4000` | Auto-dismiss time (ms), 0 to disable |
| `gap` | `number` | `12` | Gap between toasts (px) |

**Placement options:** `'top-start'`, `'top-center'`, `'top-end'`, `'bottom-start'`, `'bottom-center'`, `'bottom-end'`

---

## Customization

### CSS Custom Properties

Override in your global styles:

```css
:root {
  /* Animation */
  --kodon-toast-duration: 350ms;
  --kodon-toast-easing: cubic-bezier(0.165, 0.84, 0.44, 1);
  
  /* Layout */
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

## Credits

Animation approach inspired by [Sonner](https://sonner.emilkowal.ski/) by Emil Kowalski.

---

## License

MIT © George Kokkiinis
