# Motion Recipes - clip-path, Springs, Gestures

Implementation patterns for the decisions made in SKILL.md. Load this when actually building clip-path reveals, spring-driven motion, or drag/gesture interactions.

---

## clip-path as an Animation Tool

`clip-path` animates on the GPU and enables patterns that opacity and transform cannot produce. It is not just for shapes.

### The inset shape

`clip-path: inset(top right bottom left)` defines a rectangular clipping region. Each value eats into the element from that side.

```css
.hidden  { clip-path: inset(0 100% 0 0); }  /* Hidden from right */
.visible { clip-path: inset(0 0 0 0); }     /* Fully visible */
```

### Tabs with seamless colour transitions

Duplicate the tab list. Style the copy as the active state - different background, different text colour. Clip the copy so only the active tab's region is visible. Animate the clip on tab change.

This produces a colour transition that timing individual colour properties cannot achieve - the text colour shifts cleanly with the background, with no intermediate blended state.

```css
.tabs-active-overlay {
  clip-path: inset(0 calc(100% - var(--active-tab-right)) 0 var(--active-tab-left) round 6px);
  transition: clip-path 200ms var(--ease-out);
}
```

**Fails if absent:** R - individual colour transitions on tab switch read as two separate state changes, not one.

### Hold-to-confirm pattern

Use `clip-path: inset(0 100% 0 0)` on a coloured overlay. On `:active`, transition to `inset(0 0 0 0)` over 2s with linear timing. On release, snap back with 200ms ease-out. The hold duration signals the action is intentional. The fast release signals the system is responsive.

```css
.btn-danger .overlay {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms var(--ease-out);
  background: rgba(255, 60, 60, 0.15);
  border-radius: inherit;
}

.btn-danger:active .overlay {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;
}
```

**CRISP dimension:** P - destructive actions must require deliberate, sustained intent.

### Image and content reveals on scroll

```css
.reveal {
  clip-path: inset(0 0 100% 0);
  transition: clip-path var(--duration-slow) var(--ease-out);
}

.reveal.is-visible {
  clip-path: inset(0 0 0 0);
}
```

Trigger `.is-visible` with `IntersectionObserver` at `{ rootMargin: '-80px' }`. Use `once: true` - the reveal should not replay on scroll-back.

---

## Spring Physics

Springs simulate real physics. They settle rather than stop. They maintain velocity when interrupted. Use them for gesture-driven interactions. Do not use them for standard UI state transitions - they carry overhead inappropriate for frequent interactions.

### Spring configuration

```js
// Readable - Apple's approach
{ type: 'spring', duration: 0.4, bounce: 0.15 }

// More control
{ type: 'spring', stiffness: 300, damping: 30 }
```

Keep bounce below 0.25 for product UI. Reserve higher values for onboarding or explicitly playful contexts.

### Mouse-tracking with spring interpolation

Tying visual changes directly to mouse position feels artificial - it lacks inertia. Use `useSpring` to interpolate the value.

```jsx
import { useSpring } from 'motion/react';

const springRotation = useSpring(mouseX * 0.1, {
  stiffness: 100,
  damping: 10,
});
```

This is decorative motion on a low-frequency surface. It earns its place there.

### Interruptibility

Springs maintain velocity when interrupted mid-animation. CSS keyframes restart from zero. For any gesture a user might reverse mid-motion, springs produce the correct physical behaviour. Keyframes do not.

---

## Gesture and Drag Craft

### Dismiss on velocity, not distance

```js
const velocity = Math.abs(dragDistance) / elapsedMs;

if (Math.abs(dragDistance) > THRESHOLD || velocity > 0.11) {
  dismiss();
}
```

**Fails if absent:** S - the interaction has a hard wall where physics should be.

### Damping at boundaries

When a user drags past the natural boundary, apply damping. The more they drag, the less the element moves. Hard stops feel broken.

```js
const dampedY = rawY > 0 ? rawY : rawY * 0.15;
element.style.transform = `translateY(${dampedY}px)`;
```

### Pointer capture

Once dragging starts, capture all pointer events. Drag continues even if the pointer leaves the element bounds.

```js
element.addEventListener('pointerdown', (e) => {
  element.setPointerCapture(e.pointerId);
});
```

### Multi-touch protection

Ignore additional touch points after the initial drag begins. Without this, switching fingers mid-drag causes the element to jump.

```js
function onPointerDown(e) {
  if (isDragging) return;
  startDrag(e);
}
```
