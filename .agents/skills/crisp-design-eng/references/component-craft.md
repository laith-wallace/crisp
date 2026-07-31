# Component Craft Rules - `/crisp-design-eng` reference

The full rationale and exact code fix for each of the ten craft rules indexed in `SKILL.md`. Load this file before writing any fix.

---

## Buttons must confirm they were pressed

Add `transform: scale(0.97)` on `:active`. No exceptions for interactive elements.

```css
.btn-primary,
.btn-ghost {
  transition: transform var(--duration-fast) var(--ease-out),
              opacity  var(--duration-fast) var(--ease-out);
}

.btn-primary:active,
.btn-ghost:active {
  transform: scale(0.97);
}
```

**Fails if absent:** R - the user receives no confirmation the interface registered their press.

---

## Nothing enters from scale(0)

Nothing in the physical world appears from nothing. Elements animating from `scale(0)` look synthetic - they break the spatial logic the user's brain is using to navigate.

Start from `scale(0.95)` combined with `opacity: 0`. The difference in starting scale is barely visible. The difference in perception is significant.

```css
/* Fails R */
.entering { transform: scale(0); }

/* Correct */
.entering {
  transform: scale(0.95);
  opacity: 0;
}
```

**Fails if absent:** R - the animation lacks physical logic.

---

## Popovers scale from their trigger

A popover expanding from centre looks like a modal. It breaks spatial orientation. The popover should scale from the point the user clicked.

```css
/* Radix UI */
.popover-content {
  transform-origin: var(--radix-popover-content-transform-origin);
}

/* Base UI */
.popover-content {
  transform-origin: var(--transform-origin);
}
```

**Exception:** Modals stay at `transform-origin: center`. They are not anchored to a specific trigger.

**Fails if absent:** C - the user's spatial model is wrong. The popover appears to come from nowhere.

---

## Tooltips: remove delay and animation after first hover

Tooltips should delay before the first appearance to prevent accidental activation. Once one tooltip is open, adjacent tooltips must open instantly with no animation. This makes toolbars and action rows feel fast without defeating the original purpose of the delay.

```css
.tooltip {
  transition: transform var(--duration-fast) var(--ease-out),
              opacity  var(--duration-fast) var(--ease-out);
  transform-origin: var(--transform-origin);
}

.tooltip[data-starting-style] {
  opacity: 0;
  transform: scale(0.97);
}

/* Skip animation on subsequent triggers */
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

**Fails if absent:** R - every subsequent tooltip hover carries animation overhead the user never needed.

---

## Use blur to bridge imperfect crossfades

When two states crossfade and the transition looks like two overlapping objects rather than one thing changing, add `filter: blur(2px)` at the midpoint. Blur prevents the eye from resolving two distinct states as separate objects. Keep blur under `4px` - above that it is expensive, especially in Safari.

```css
.button-content {
  transition: filter var(--duration-fast) var(--ease-out),
              opacity var(--duration-fast) var(--ease-out);
}

.button-content.is-transitioning {
  filter: blur(2px);
  opacity: 0.7;
}
```

---

## Never use `transition: all`

Always list only the properties you intend to animate - typically `opacity` and `transform`. `transition: all` accidentally animates layout-affecting properties (`height`, `width`, `padding`, `margin`) causing reflows and jank on every state change.

```css
/* Fails - animates everything including layout properties */
.btn { transition: all 200ms; }

/* Correct - only what moves */
.btn {
  transition: transform var(--duration-fast) var(--ease-out),
              opacity  var(--duration-fast) var(--ease-out);
}
```

**Fails if present:** R - layout-triggering animations produce jank, which breaks the perception of responsiveness.

---

## Animations must be interruptible

Every animation must be cancellable by user input. An animation that locks out interaction is a cage, not a transition. CSS transitions handle interruption correctly - they retarget mid-animation. Keyframe animations restart from zero and should not block user input.

For gesture-driven interactions, springs are correct precisely because they maintain velocity when interrupted. The animation resolves from wherever it was, not from the beginning. (Implementation patterns: `motion-recipes.md`.)

**Fails if absent:** R - an animation that cannot be interrupted signals the UI is not listening to the user.

---

## Animate entry with @starting-style

```css
.modal {
  opacity: 1;
  transform: translateY(0) scale(1);
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);

  @starting-style {
    opacity: 0;
    transform: translateY(8px) scale(0.98);
  }
}
```

Fall back to `data-mounted` attribute pattern where browser support requires it.

---

## Stagger list entries

When multiple elements appear together, stagger them. Everything appearing at once reads as a page refresh. Keep stagger increments short: 30–80ms per item. Stagger is decorative - never block interaction while stagger animations are running.

```css
.card { animation: fadeUp var(--duration-slow) var(--ease-out) both; }
.card:nth-child(1) { animation-delay: 0ms; }
.card:nth-child(2) { animation-delay: 60ms; }
.card:nth-child(3) { animation-delay: 120ms; }
.card:nth-child(4) { animation-delay: 180ms; }

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## Asymmetric enter/exit timing

Enter can be measured. Exit must be fast. When a user dismisses something, the system is responding to a clear intent. Delay here is friction.

```css
.drawer { transition: transform 300ms var(--ease-drawer); }
.drawer.is-closing { transition: transform 200ms var(--ease-out); }
```

Apply broadly: enter 300ms, exit 150–200ms. The asymmetry is felt as the interface being fast - not noticed as a design decision.

---

# Component Philosophy

These principles apply when building components that others will use - not just one-off interfaces.

## Zero-configuration default

The component must work correctly with no configuration. One import, one render, correct behaviour. Every required configuration step is a barrier most users will not cross.

**CRISP dimension:** S - friction in the developer interface becomes friction in the user interface.

## Defaults are the product

Most users never change defaults. The default easing, timing, and behaviour *are* the product for the majority of people who install it. Ship defaults that are correct, not defaults that are safe.

**CRISP dimension:** I - a component with poor defaults ships poor defaults to every product that installs it.

## Handle edge cases invisibly

The cases users never encounter consciously matter most in aggregate. Every one of these is invisible when correct and visible when wrong:

- Pause timers when the browser tab is hidden - `document.addEventListener('visibilitychange', ...)`
- Fill gaps between stacked toast elements with pseudo-elements to maintain hover state continuity
- Capture pointer events during drag to prevent state loss when the pointer leaves bounds
- Ignore subsequent touch points after drag begins to prevent position jumps on finger switch
- Debounce rapid state changes to prevent animation collisions on fast interaction

## Match the motion to the personality

A 150ms sharp ease-out is correct for a dashboard action row. The same values feel cold in an onboarding flow. Choose durations and easing that fit the emotional register of the surface - not values that are technically defensible in isolation. The motion should not create a contradiction with what the surface is for.
