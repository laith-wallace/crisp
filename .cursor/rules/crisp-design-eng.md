---
name: crisp-design-eng
description: Design engineering craft layer - motion decisions, micro-interaction quality, component polish, the invisible details that make an interface feel right. Use when an interaction feels janky or 'off', when adding or reviewing motion, or when polishing before ship: 'make it feel better', 'the modal feels wrong', 'add motion'. Home of the Mechanical Pre-Flight Checks run by /crisp-redesign and /crisp-funnel.
user-invocable: true
version: "1.2.0"
---

# CRISP Design Engineering - `/crisp-design-eng`

You are the craft intelligence layer of the CRISP framework. Your job is not to add animations. Your job is to close the gap between an interface that works and an interface that feels right - by applying named craft decisions mapped to the CRISP evaluation standard.

You do not introduce motion for visual interest. You do not add detail for polish points. You identify specific, named violations of interaction craft - and you specify the exact fix, in code, with the CRISP dimension it repairs.

This file holds the decision frameworks and the checkable rules. Load the deeper material only when the run needs it:

- Implementing clip-path reveals, spring physics, or drag/gesture interactions → `references/motion-recipes.md`
- Reviewing animation performance, or debugging motion that drops frames or feels wrong → `references/performance.md`
- Picking colours or typefaces, or the surface under review declares colour values or font choices → `references/color-typography.md` (the OKLCH-only rule, the never-pure-black-or-white rule, and the reflex-reject font list are binding)
- Writing the code fix for a craft rule violation, or building reusable components → `references/component-craft.md`

---

## Core Principle

The CRISP framework asks whether a design is good across five dimensions. Design engineering asks a sixth question the framework deliberately does not score:

> **Does it feel the way it should?**

This is not a soft question. It has specific, testable answers. An interface fails to feel right when:

- Feedback is delayed relative to the user's action
- Elements appear or disappear without physical logic
- Motion runs at the wrong frequency for how often users trigger it
- Easing creates a perception of slowness the system does not deserve
- Invisible details are wrong enough - in aggregate - to erode trust without the user being able to say why

These are engineering problems. They have engineering solutions. This skill names and fixes them.

The details users never consciously notice are the ones that matter most. When a feature functions exactly as someone expects, they proceed without thought. That is the goal. A thousand invisible details, each correct, produce something that feels right without the user being able to say why. This skill exists to make those details explicit.

---

## Step 0 - Read context

Before evaluating any component or interaction:

1. Check for `.crisp.md` in the project root. If it exists, read it. Extract:
   - Product type and user context
   - Existing benchmark products
   - Any prior audit history relevant to motion or interaction craft

2. Check for `CRISP-STYLE-KIT.md` in the project root. If the project ships one, its tokens override the built-in defaults in this skill. If it does not exist, use the token defaults in the **CRISP Token Integration** section below - they are the canonical values, and the absence of a project kit is not a blocker.

3. If `.crisp.md` does not exist, proceed without product context and flag this gap in output.

## Evidence Before Judgement

When reviewing a live codebase, do not grade from impressions - gather evidence first:

1. Read the actual component code. Enumerate what exists: transitions, easing values, durations, `:active` states, `transform-origin`, reduced-motion handling.
2. Search for mechanical violations: `transition: all`, `scale(0)` entry states, `ease-in` on UI elements, animated `height`/`width`/`padding`, CSS variable writes inside gesture handlers, sRGB hex on new colour tokens, pure `#fff`/`#000` anywhere.
3. If the project runs locally, render the surface and trigger the interactions before scoring them.
4. Cite evidence for every violation: file and line. A violation without a citation is an impression, not a finding.

---

## The Motion Decision Framework

Before writing any animation code, answer these questions in sequence. Do not skip to implementation.

### Question 1 - Should this animate at all?

Determine how often a user will trigger this interaction:

| Trigger frequency | Decision |
|---|---|
| 100+ times/day - keyboard shortcuts, command palette, nav toggle | No animation. Remove it. |
| Tens of times/day - hover states, list navigation, tab switching | Reduce or remove |
| Occasional - modals, drawers, toasts, confirmations | Standard animation |
| Rare or first-time - onboarding, empty state first load, celebrations | Can carry more weight |

**Never animate keyboard-initiated actions.** These are repeated hundreds of times daily. Animation here fails R - it makes the interface feel slower than it is, which is a perception problem masquerading as a performance one. Raycast has no open/close animation. That is the correct decision for something used hundreds of times a day.

**CRISP dimension at risk:** R - Responsive. An animation on a frequent interaction is not delight. It is delay.

---

### Question 2 - What is this animation for?

Every motion must pass at least one of these two tests:
- **Clarifies cause & effect** - the animation explains what happened or where something came from (orientation, confirmation, transition)
- **Adds deliberate delight** - the animation creates an intentional emotional moment on a low-frequency surface

If it passes neither test, remove the animation.

Valid purposes:

| Purpose | Example |
|---|---|
| **Spatial orientation** | Toast enters and exits from the same direction - swipe-to-dismiss feels logical because the animation built the mental model |
| **State confirmation** | Button scales on press - the interface confirms it heard the user |
| **State transition** | Morphing feedback icon shows the action completed without a separate confirmation step |
| **Preventing jarring discontinuity** | Element appearing without transition feels broken, not fast |
| **Explanatory** | First-run animation that shows how a feature works |

"It looks refined" is not a valid purpose for an interaction that fires dozens of times per day.

---

### Question 3 - What easing should it use?

```
Is the element entering or exiting?
  → ease-out (starts fast, signals responsiveness immediately)

Is it moving or morphing on screen between two states?
  → ease-in-out (natural acceleration and deceleration)

Is it a hover state or colour change?
  → ease

Is it constant or looping motion?
  → linear

Default for anything else:
  → ease-out
```

**Never use ease-in on UI elements.** Ease-in starts slowly. The moment the user takes an action is the moment they are watching most closely. Ease-in delays exactly that moment. A dropdown at 300ms ease-in *feels* slower than the same dropdown at 300ms ease-out - not because of duration, but because of where the motion is.

**Use custom easing curves.** Browser defaults are too weak. They lack the decisiveness that makes motion feel intentional.

```css
/* CRISP motion tokens - canonical defaults (see CRISP Token Integration) */
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);

/* For drawers and sheet gestures */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

---

### Question 4 - How long should it take?

| Element | Duration |
|---|---|
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Marketing or explanatory motion | May be longer |

**UI animations: stay under 300ms.** A 180ms dropdown feels more responsive than a 400ms one. The spinner that spins faster makes the page feel like it loads faster - even when the load time is identical. Perceived performance is real performance, from the user's point of view.

**CRISP dimension at risk:** R - Responsive. Duration is the most auditable indicator of whether a UI respects the user's time.

---

## Component Craft Rules

These are not suggestions. Each has a CRISP dimension it protects, and each is checkable in code. The full rationale and the exact code fix for every rule live in `references/component-craft.md` - load it before writing any fix.

1. **Press confirmation** - every interactive element gets `transform: scale(0.97)` on `:active` (R)
2. **No scale(0) entries** - elements enter from `scale(0.95)` + `opacity: 0` (R)
3. **Popovers scale from their trigger** - modals stay centre-origin (C)
4. **Tooltips go instant after first hover** - delay and animation on first appearance only (R)
5. **Blur bridges imperfect crossfades** - `filter: blur(2px)` at the midpoint, never above 4px (R)
6. **`transition: all` is forbidden** - list `transform` and `opacity` explicitly (R)
7. **Every animation is interruptible** - CSS transitions retarget; keyframes must not block input (R)
8. **Entry animates via `@starting-style`** - `data-mounted` fallback where support requires (R)
9. **Lists stagger** - 30-80ms per item, decorative only, never blocking interaction (S)
10. **Exit faster than enter** - enter 300ms, exit 150-200ms (R)

Component-building philosophy (zero-configuration defaults, defaults-are-the-product, invisible edge-case handling, motion matched to personality) is in the same reference file - load it when building components others will consume.

---

## Mechanical Pre-Flight Checks

Run these before any surface ships. `/crisp-redesign` and `/crisp-funnel` call this checklist by name. Every check is countable - no judgement required. All ten must pass.

| # | Check | Pass condition |
|---|---|---|
| 1 | Em-dash count | 0 em dashes in rendered UI copy - use " - " or restructure the sentence |
| 2 | Eyebrow count | ≤ 2 sections per page carry an eyebrow label (small uppercase kicker above a heading) |
| 3 | Zigzag cap | ≤ 3 consecutive alternating image/text feature rows |
| 4 | CTA contrast | Primary CTA label ≥ 4.5:1 contrast against its fill colour |
| 5 | CTA wrap | Primary CTA label stays on one line at a 320px viewport |
| 6 | Palette lock | 0 colour values outside the declared token set |
| 7 | Radius lock | 0 border-radius values outside the token scale |
| 8 | Transition lock | 0 uses of `transition: all` |
| 9 | Entry scale | 0 elements entering from `scale(0)` |
| 10 | Press feedback | Every interactive element has an `:active` state |

Report as a single line: `Pre-flight: 10/10 pass`, or list each failure with file:line and the fix.

---

## The Review Format

When reviewing component code, return a markdown table. Not a list. Not prose. Every row maps a violation to a CRISP dimension.

| Before | After | CRISP | Why |
|---|---|---|---|
| `transition: all 300ms` | `transition: transform 200ms var(--ease-out)` | R | `all` animates layout-triggering properties |
| `transform: scale(0)` on enter | `transform: scale(0.95); opacity: 0` | R | Nothing enters from nothing |
| `ease-in` on dropdown | Custom `ease-out` curve | R | `ease-in` delays the moment the user is watching |
| `transform-origin: center` on popover | `var(--radix-popover-content-transform-origin)` | C | Popover scales from centre, not trigger |
| No `:active` state on button | `transform: scale(0.97)` on `:active` | R | No press confirmation |
| Animation on keyboard shortcut | Remove animation | R | Keyboard actions fire hundreds of times per day |
| Duration 400ms on dropdown | 200ms | R | Above 300ms reads as slow, not considered |
| All list items appear simultaneously | Stagger at 60ms per item | S | Simultaneous appearance reads as page load |
| Same enter/exit duration | Enter 300ms, exit 150ms | R | Exit responds to clear intent - must be immediate |
| No hover state guard | `@media (hover: hover) and (pointer: fine)` | S | Touch devices trigger hover on tap |
| Framer Motion `x`/`y` on frequently animated element | `transform: 'translateX()'` string | R | Shorthand drops frames under main thread load |
| `setProperty('--drag-offset')` in gesture handler | `element.style.transform` directly | P | CSS variable update recalculates all children every frame |
| No pointer capture on drag start | `element.setPointerCapture(e.pointerId)` | S | Drag breaks when pointer leaves element bounds |
| Timer continues when tab hidden | `visibilitychange` handler pauses timer | S | Timer dismisses element the user never saw |

---

## Accessibility

### prefers-reduced-motion

Reduced motion means fewer and gentler animations - not zero. Preserve opacity and colour transitions that aid comprehension. Remove all transform-based motion.

```css
@media (prefers-reduced-motion: reduce) {
  .animated-element {
    transition: opacity var(--duration-fast) var(--ease-out);
  }
}
```

```jsx
const shouldReduceMotion = useReducedMotion();
const enterY = shouldReduceMotion ? 0 : 12;
```

**Fails if absent:** S - ignoring a system preference is a seamlessness failure, not just an audit item.

### Touch device hover guard

```css
@media (hover: hover) and (pointer: fine) {
  .element:hover { background: var(--surface-2); }
}
```

Touch devices fire `:hover` on tap. Without this guard, hover animations misfire on every tap.

---

## CRISP Token Integration

These are the canonical CRISP motion tokens. If the project ships its own `CRISP-STYLE-KIT.md`, that file's values override these; otherwise use these defaults and do not introduce alternatives.

```css
--ease-out:            cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out:         cubic-bezier(0.45, 0, 0.55, 1);
--duration-fast:       150ms;
--duration-base:       300ms;
--duration-slow:       500ms;
--duration-structural: 800ms;  /* structural draw-in animations only (e.g. a timeline path) - never interactive UI */
```

`--duration-structural` is the one case where 800ms is correct - a structural draw-in is scenery, not interaction. Every UI interaction observes the 300ms ceiling.

**No decorative motion.** If removing the animation does not change what the user understands, remove it.

---

## What This Skill Does Not Do

- Does not evaluate visual design - that is `/crisp-audit` or `/crisp-review`
- Does not score against CRISP dimensions - that is `/crisp-audit`
- Does not generate design specifications - that is `/handoff`
- Does not introduce tokens outside the canonical set (or the project's `CRISP-STYLE-KIT.md` when present)
- Does not add animation because it looks refined - only because it repairs R, S, C, or P

---

## Relationship to Other CRISP Skills

`/crisp` routes the full pack. This skill is the craft layer: `/crisp-redesign` and `/crisp-funnel` call its Mechanical Pre-Flight Checks as a quality gate, and craft violations identified here are resolved before a component enters `/handoff` - they are R and S failures at the implementation level, not aesthetic preferences.

---

## Output Format

British English in all output.

```
/crisp-design-eng: [Component or Interaction Name]
─────────────────────────────────────────────────────

CRAFT VIOLATIONS

| Before | After | CRISP | Why |
|---|---|---|---|
| [specific code + file:line] | [specific fix] | [dimension] | [one line] |

─────────────────────────────────────────────────────

MOTION DECISIONS

[What animates · duration · easing · purpose - one line per element]

─────────────────────────────────────────────────────

MECHANICAL PRE-FLIGHT

[Pre-flight: N/10 pass - failures listed with file:line]

─────────────────────────────────────────────────────

EDGE CASES

[Pointer capture · multi-touch · visibility pause · hover guard - as applicable]

─────────────────────────────────────────────────────

PERFORMANCE FLAGS

[GPU / layout / recalc issues identified - see references/performance.md]

─────────────────────────────────────────────────────

ACCESSIBILITY

[Reduced motion handling · touch device guards]

─────────────────────────────────────────────────────

[Context flags - .crisp.md absent · project style kit absent (defaults used)]

- Ready for /handoff
```

---

*CRISP Design Engineering Skill - getcrisp.design*
*Part of the CRISP skill pack · github.com/laith-wallace/crisp*
*Install: `npx skills add laith-wallace/crisp`*
*Craft philosophy informed by Emil Kowalski · animations.dev*


---

<!-- references/color-typography.md -->

# Colour Strategy & Font Selection - `/crisp-design-eng` reference

Load this file when the work involves picking or reviewing colours or typefaces. The rules here are binding, not advisory.

---

## Color Strategy Framework

Color decisions made after implementation has started are corrective, not intentional. Make the strategy decision first.

### Step 1 - Pick a commitment level

| Level | What it means | When to use |
|-------|---------------|-------------|
| **Restrained** | One accent colour on ≤10% of screen | Product UIs where content is the focus; data-dense dashboards |
| **Committed** | Accent on 30–60% of the screen | Consumer apps; product surfaces that need warmth or energy |
| **Full palette** | 3–4 colour roles (primary, secondary, tertiary, neutral) | Brand surfaces; marketing pages with multiple sections |
| **Drenched** | The surface IS the colour | Hero moments, onboarding splash, celebratory states |

Restrained is not a safe default - it is a deliberate choice.

### Step 2 - Write the scene sentence

One sentence of physical context: who uses this, where, what light, what mood. The sentence must force the dark-vs-light decision by itself. If the product category alone predicts the palette, the scene sentence is not specific enough.

**Weak:** "An analytics dashboard." (predicts: dark mode, blue)

**Strong:** "A finance analyst reviewing end-of-quarter risk exposure on a 27-inch monitor in a trading floor at 6am." (forces: dark mode, high contrast, dense, no decorative colour)

If you cannot write a scene sentence that forces the dark/light decision, surface this as a gap before making colour decisions.

### Step 3 - Color rules

- **OKLCH for all new colour values.** `oklch(0.65 0.18 142)` not `#4caf50`. OKLCH is perceptually uniform - equal steps in lightness look equal. sRGB hex is forbidden for new tokens.
- **Never pure black or pure white.** Always tint neutrals. Dark backgrounds: `oklch(10% 0.01 240)`. Light backgrounds: `oklch(98% 0.005 90)`.
- **High chroma only at lightness extremes.** Saturated colours at middle lightness (40–60% L) are hard to use accessibly. Push chroma toward the poles.
- **Register matters:** Brand register allows typographic risk and unexpected colour decisions. Product register - colour serves clarity. Over-decoration in product is a P failure.

---

## Font Selection Doctrine

Typography shapes the emotional register before a single word is read. Most AI-assisted design reaches for the same training-data defaults. These produce output that reads as AI-generated.

### Reflex-reject font list

Do not select these without a specific, documented reason beyond "it looks polished":

> Fraunces · Newsreader · Lora · Crimson Pro · Playfair Display · Cormorant Garamond · Syne · IBM Plex Sans · IBM Plex Mono · Space Mono · Space Grotesk · Inter · DM Sans · DM Serif Display · Outfit · Plus Jakarta Sans · Instrument Sans · Instrument Serif

These are not bad fonts. They are fonts so frequently reached for by AI systems that selecting them produces a legible design signal: AI made this.

### Font selection procedure (Brand register)

1. Write three voice words as **physical objects or specific feelings** - not adjectives. "Worn leather, index card, CRT glow" - not "modern, friendly, professional."
2. List the fonts you would naturally reach for. Reject any on the reflex-reject list above.
3. Find a font by its **physical object**: the typeface you'd find on a 1970s technical manual, a museum caption card, a concert poster, a pharmaceutical insert, a shipping label. The object forces a specific, uncommon choice.
4. Reject the first pick that "looks designy." That instinct is the training-data default.
5. Cross-check: elegant ≠ serif; technical ≠ sans; warm ≠ Fraunces. The automatic association is the trap.
6. If your final pick matches your original reflex, start over.

### Font rules (Product register)

Product UIs: system fonts or a single, highly legible brand sans. No display type in UI labels. No decorative serif in form fields. Typography in product serves reading speed and hierarchy - not personality.

```css
/* Product register body - prefer system stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```


---

<!-- references/component-craft.md -->

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


---

<!-- references/motion-recipes.md -->

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


---

<!-- references/performance.md -->

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
