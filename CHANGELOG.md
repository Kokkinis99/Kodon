# Changelog

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
