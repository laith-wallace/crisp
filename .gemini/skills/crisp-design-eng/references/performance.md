# Animation Performance and Debugging

Performance rules and debugging techniques for the craft decisions in SKILL.md. Load this when reviewing animation performance or diagnosing motion that drops frames or feels wrong.

---

## Performance Rules

### Animate transform and opacity only

`transform` and `opacity` bypass layout and paint and run on the GPU. Animating `padding`, `height`, `width`, or `margin` triggers the full rendering pipeline. Every animated property that is not `transform` or `opacity` is a performance violation until proven otherwise.

**Fails:** R - a janky animation is the opposite of feeling instant.

### Do not update CSS variables inside gesture handlers

CSS variables on a parent recalculate styles for all children. Updating `--drag-offset` on a container during `pointermove` recalculates every child on every frame.

```js
// Recalculates all children - fails P
element.style.setProperty('--drag-offset', `${distance}px`);

// Correct - only affects this element
element.style.transform = `translateY(${distance}px)`;
```

### Framer Motion shorthand is not hardware-accelerated

`x`, `y`, `scale` shorthand props use `requestAnimationFrame` on the main thread. They drop frames when the browser is loading content or running scripts.

```jsx
// NOT hardware-accelerated
<motion.div animate={{ x: 100 }} />

// Hardware-accelerated
<motion.div animate={{ transform: 'translateX(100px)' }} />
```

(Verify against the current Motion documentation before citing this in a review - the library's acceleration story evolves between major versions.)

### Use CSS transitions for interruptible UI; WAAPI for programmatic GPU performance

CSS transitions retarget mid-animation. Keyframes restart from zero. For rapidly-triggered interactions, use transitions.

WAAPI provides JavaScript control at CSS performance:

```js
element.animate(
  [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }],
  { duration: 300, fill: 'forwards', easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
);
```

---

## Debugging Craft Violations

### Test at reduced speed

Before calling a component done, test its animations at 5× duration. Issues invisible at full speed become obvious in slow motion: incorrect easing, wrong `transform-origin`, properties that go out of sync, overlapping states during crossfades.

### Test on real devices

For gesture interactions, test on physical hardware. Simulator gesture behaviour is not representative. Connect via USB, visit the local dev server by IP, use remote devtools. What feels smooth on desktop drops frames on device.

### Review the next day

Timing issues invisible during development become obvious with distance. What felt "slightly slow" the day before reads as "clearly slow" the day after. Review animations with fresh eyes before shipping.
