# Kodon

**Sonner-style toast notifications for Angular**, built on [ng-primitives](https://ng-primitives.mintlify.app/).

Smooth, interruptible animations with stacking, hover expansion, and swipe-to-dismiss.

Live demo: [kodon.kokkin.is](https://kodon.kokkin.is)

---

## Usage

This is a copy-paste library, not an npm package. Copy the files, own the code.

### 1. Install peer dependencies

```bash
npm install ng-primitives lucide-angular
```

### 2. Copy these files into your project

- [`toast.component.ts`](src/lib/toast.component.ts)
- [`toast.service.ts`](src/lib/toast.service.ts)
- [`provide-toast.ts`](src/lib/provide-toast.ts)
- [`toast.component.scss`](src/lib/toast.component.scss)
- [`_toast-visuals.scss`](src/lib/_toast-visuals.scss)

### 3. Wire it up

```typescript
// app.config.ts
provideKodonToast({ placement: 'bottom-end' })
```

### 4. Use it

```typescript
toast = inject(KodonToast)

this.toast.success('Changes saved')
this.toast.error('Something went wrong')
this.toast.warning('Session expiring soon')
this.toast.info('New version available')
```

---

## Configuration

```typescript
provideKodonToast({
  placement: 'bottom-end', // 'top-start' | 'top-center' | 'top-end' | 'bottom-start' | 'bottom-center' | 'bottom-end'
  duration: 5000,          // auto-dismiss time in ms
  maxToasts: 3,            // max visible at once
  gap: 14,                 // gap between expanded toasts (px)
  swipeThreshold: 100      // swipe distance before dismiss (px)
})
```

Swipe directions are auto-calculated from placement — toasts can only be swiped toward screen edges.

---

## Customisation

The files are split on purpose. `_toast-visuals.scss` owns colors, typography, and variant styles. `toast.component.scss` owns animations, stacking, and layout. You can rework the visuals without touching the animation logic, or replace both entirely.

### Colors — override in your global styles or edit the file directly

```scss
:root {
  --kodon-toast-success-bg: hsl(142 76% 96%);
  --kodon-toast-success-border: hsl(142 76% 82%);
  --kodon-toast-success-text: hsl(142 76% 18%);
  --kodon-toast-success-icon: hsl(142 76% 36%);

  /* same pattern for error, warning, info */
}
```

### Animation — adjust in `toast.component.scss`

```scss
:host {
  --kodon-toast-peek: 11px;          /* how much stacked toasts peek above each other */
  --kodon-toast-width: 355px;
  --kodon-toast-border-radius: 10px;
  --kodon-toast-duration: 350ms;
  --kodon-toast-easing: cubic-bezier(0.165, 0.84, 0.44, 1);
}
```

---

## How it works

The animations use CSS transitions, not keyframes — so they can be interrupted mid-flight. If a new toast arrives while one is entering, it picks up from wherever it is rather than restarting.

Exit runs via the Web Animations API so the animation can complete before the DOM node is removed. A container-level pointer guard keeps the stack expanded during swipe gestures and exit animations, preventing it from collapsing while toasts are mid-transition.

Inspired by [Sonner](https://sonner.emilkowal.ski/) by Emil Kowalski and the [ng-primitives](https://ng-primitives.mintlify.app/) headless toast implementation.

---

## License

MIT © [George Kokkinis](https://kokkin.is)
