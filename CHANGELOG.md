# Changelog

## 0.4.0 - 2026-11-07

- Identical toasts collapse into one with a count (`×3`) instead of stacking copies. Each repeat starts the countdown over and bumps the toast. Give toasts the same `group` to collapse ones with different text, pass `group: false` to opt one out, or turn it off with `groupDuplicates: false`.
- `toast.promise()` takes an Observable, such as an `HttpClient` call, as well as a promise.
- `toast.resource()` follows a `resource()` or `httpResource()` through loading, success and error, on every reload. Each message is optional.
- A `progress` option takes a signal from 0 to 1 and draws a bar along the bottom of the toast. `httpResource` progress shows up on its own with `reportProgress: true`.
- Updating a toast while it's leaving shows a new one instead of changing the one on its way out.

Changed: identical toasts now group by default. Pass `groupDuplicates: false` to `provideKodonToast` to keep them stacking.

## 0.3.0 - 2026-11-06

- Toasts pause while the tab is hidden, so one that would have timed out in the background is still there when you come back, with the time it had left. A toast shown while the tab is hidden waits for you before it starts counting down.

## 0.2.0 - 2026-11-06

- Needs Angular 21 or 22 and ng-primitives 0.131 or later, the same versions paraskinio runs.
- Icons come from `@lucide/angular`, Lucide's maintained Angular package. `lucide-angular` doesn't support Angular 22.
- Works zoneless. The demo and promo now run without zone.js.
- Loading toasts and `duration: Infinity` use ng-primitives' persistent timer instead of patching its `start()`.

Breaking: install `@lucide/angular` in place of `lucide-angular`. Kōdon's icons are now `<svg lucideX>` directives, so a selector like `.kodon-toast-icon lucide-icon` needs to target `svg` instead.

## 0.1.0 - 2026-11-06

- `toast.promise()`: a loading toast that turns into success or error in place when the promise settles.
- `toast.loading()`, and a `loading` variant with a spinner. It stays until updated or dismissed.
- Toasts have ids. Showing a toast with an id that's on screen updates it in place, with the new icon and text animating in.
- `toast.dismiss(id)` closes one toast; `toast.dismiss()` closes them all.
- Per-toast `placement`, `duration`, `icon` and `id` on every method.
- Toasts of different heights stack cleanly: collapsed, the ones behind take the front toast's height.
- Top placements drop in from above and stack downward, instead of moving as if they were at the bottom.
- The demo has a placement picker, promise and update examples, and code that follows what you click.

Breaking: methods return `{ id, dismiss }` instead of ng-primitives' `NgpToastRef`, and `KodonToastContext` now holds a `state` signal. Variant colours are drawn on `.kodon-toast-content::before`, so restyle that if you override backgrounds or borders.

## 0.0.3 - 2026-11-06

- Closing a toast with × pops it in place instead of sliding it away. `dismiss('pop')` gives the same exit from your own controls.
- With reduced motion, toasts fade out instead of sliding or popping.
- `top-center` and `bottom-center` toasts sit centred. They used to sit entirely left of centre.
- `top-start` and `bottom-start` toasts sit inside the screen. They used to hang off its left edge.
- On phones, toasts keep a 16px gutter on each side instead of overflowing, and bottom toasts sit above the home indicator.
- The × takes presses across 44px, not just its 24px.

## 0.0.2 - 2026-10-25

- New toasts slide in again on recent ng-primitives, which sets `data-front` after the toast is already in the DOM.
- Clicking × closes the toast even if the pointer moves a little during the click.
- `top-center` and `bottom-center` toasts can be swiped left and right as well as toward their edge.
