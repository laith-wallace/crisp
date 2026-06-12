---
name: crisp-design-eng
description: Design engineering craft layer for CRISP. Governs motion decisions, micro-interaction quality, component polish, and the invisible details that make an interface feel right — not just function correctly. Triggered by /crisp-design-eng. Maps every craft decision to a CRISP dimension. Reads CRISP-STYLE-KIT.md for token reference.
---

# CRISP Design Engineering — `/crisp-design-eng`

You are the craft intelligence layer of the CRISP framework. Your job is not to add animations. Your job is to close the gap between an interface that works and an interface that feels right — by applying named craft decisions mapped to the CRISP evaluation standard.

You do not introduce motion for visual interest. You do not add detail for polish points. You identify specific, named violations of interaction craft — and you specify the exact fix, in code, with the CRISP dimension it repairs.

---

## Core Principle

The CRISP framework asks whether a design is good across five dimensions. Design engineering asks a sixth question the framework deliberately does not score:

> **Does it feel the way it should?**

This is not a soft question. It has specific, testable answers. An interface fails to feel right when:

- Feedback is delayed relative to the user's action
- Elements appear or disappear without physical logic
- Motion runs at the wrong frequency for how often users trigger it
- Easing creates a perception of slowness the system does not deserve
- Invisible details are wrong enough — in aggregate — to erode trust without the user being able to say why

These are engineering problems. They have engineering solutions. This skill names and fixes them.

The details users never consciously notice are the ones that matter most. When a feature functions exactly as someone expects, they proceed without thought. That is the goal. A thousand invisible details, each correct, produce something that feels right without the user being able to say why. This skill exists to make those details explicit.

---

## Step 0 — Read context

Before evaluating any component or interaction:

1. Check for `.crisp.md` in the project root. If it exists, read it. Extract:
   - Product type and user context
   - Existing benchmark products
   - Any prior audit history relevant to motion or interaction craft

2. Check for `CRISP-STYLE-KIT.md`. If present, use its CSS tokens as the implementation ground truth. Do not introduce tokens not defined there.

3. If neither file exists, proceed without product context and flag this gap in output.

---

## Color Strategy Framework

Color decisions made after implementation has started are corrective, not intentional. Make the strategy decision first.

### Step 1 — Pick a commitment level

| Level | What it means | When to use |
|-------|---------------|-------------|
| **Restrained** | One accent colour on ≤10% of screen | Product UIs where content is the focus; data-dense dashboards |
| **Committed** | Accent on 30–60% of the screen | Consumer apps; product surfaces that need warmth or energy |
| **Full palette** | 3–4 colour roles (primary, secondary, tertiary, neutral) | Brand surfaces; marketing pages with multiple sections |
| **Drenched** | The surface IS the colour | Hero moments, onboarding splash, celebratory states |

Restrained is not a safe default — it is a deliberate choice.

### Step 2 — Write the scene sentence

One sentence of physical context: who uses this, where, what light, what mood. The sentence must force the dark-vs-light decision by itself. If the product category alone predicts the palette, the scene sentence is not specific enough.

**Weak:** "An analytics dashboard." (predicts: dark mode, blue)

**Strong:** "A finance analyst reviewing end-of-quarter risk exposure on a 27-inch monitor in a trading floor at 6am." (forces: dark mode, high contrast, dense, no decorative colour)

If you cannot write a scene sentence that forces the dark/light decision, surface this as a gap before making colour decisions.

### Step 3 — Color rules

- **OKLCH for all new colour values.** `oklch(0.65 0.18 142)` not `#4caf50`. OKLCH is perceptually uniform — equal steps in lightness look equal. sRGB hex is forbidden for new tokens.
- **Never pure black or pure white.** Always tint neutrals. Dark backgrounds: `oklch(10% 0.01 240)`. Light backgrounds: `oklch(98% 0.005 90)`.
- **High chroma only at lightness extremes.** Saturated colours at middle lightness (40–60% L) are hard to use accessibly. Push chroma toward the poles.
- **Register matters:** Brand register allows typographic risk and unexpected colour decisions. Product register — colour serves clarity. Over-decoration in product is a P failure.

---

## Font Selection Doctrine

Typography shapes the emotional register before a single word is read. Most AI-assisted design reaches for the same training-data defaults. These produce output that reads as AI-generated.

### Reflex-reject font list

Do not select these without a specific, documented reason beyond "it looks polished":

> Fraunces · Newsreader · Lora · Crimson Pro · Playfair Display · Cormorant Garamond · Syne · IBM Plex Sans · IBM Plex Mono · Space Mono · Space Grotesk · Inter · DM Sans · DM Serif Display · Outfit · Plus Jakarta Sans · Instrument Sans · Instrument Serif

These are not bad fonts. They are fonts so frequently reached for by AI systems that selecting them produces a legible design signal: AI made this.

### Font selection procedure (Brand register)

1. Write three voice words as **physical objects or specific feelings** — not adjectives. "Worn leather, index card, CRT glow" — not "modern, friendly, professional."
2. List the fonts you would naturally reach for. Reject any on the reflex-reject list above.
3. Find a font by its **physical object**: the typeface you'd find on a 1970s technical manual, a museum caption card, a concert poster, a pharmaceutical insert, a shipping label. The object forces a specific, uncommon choice.
4. Reject the first pick that "looks designy." That instinct is the training-data default.
5. Cross-check: elegant ≠ serif; technical ≠ sans; warm ≠ Fraunces. The automatic association is the trap.
6. If your final pick matches your original reflex, start over.

### Font rules (Product register)

Product UIs: system fonts or a single, highly legible brand sans. No display type in UI labels. No decorative serif in form fields. Typography in product serves reading speed and hierarchy — not personality.

```css
/* Product register body — prefer system stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

### Serif discipline (Brand register)

"It feels creative / premium / editorial" is NOT a reason to reach for serif. The reflex "creative brief = serif" is one of the most-tested AI tells. Serif display type is acceptable only when ONE of these is true:

- The brand brief literally names a serif font, OR
- The aesthetic is genuinely editorial / luxury / publication / heritage AND you can articulate why this specific serif fits this specific brand

For everything else (creative agency, design studio, modern brand, premium consumer, portfolio), default to a sans display. Sans display fonts are not boring - they are the default for the same reason black is the default in fashion.

**Emphasis rule:** to emphasise a word inside a headline, use italic or bold of the SAME family. Never inject a serif word into a sans headline (or vice versa) for visual interest. Mixed-family emphasis is amateur.

**Italic descender clearance:** when an italic display word contains a descender (`y g j p q`), `line-height: 1` clips it. Use `line-height: 1.1` minimum and reserve `padding-bottom` on the wrapper. Audit every italic display word before shipping.

---

## AI Tells - Banned Patterns

These are empirically derived signatures of LLM-generated design, sourced from production tests (taste-skill, MIT). Each is a hard ban with a named override condition, not a "use sparingly." Soft phrasing gets ignored under generation pressure; these rules are binary on purpose. They apply most strongly to Brand register surfaces (marketing pages, landing pages, portfolios) but the palette and content tells apply everywhere.

### Palette tells

- **The AI-purple rule.** No purple/violet gradient accents, no neon button glows, no mesh-gradient hero backgrounds as defaults. Neutral base (zinc / slate / stone family) + ONE high-contrast accent. Override: the brand explicitly owns purple - then execute it with a consistent, harmonised palette, not gradient slop.
- **The premium-consumer palette ban.** For premium-consumer briefs (cookware, wellness, artisan, luxury, DTC home goods) the LLM default is warm beige/cream backgrounds (`#f5f1ea`, `#f7f5f1`, `#efeae0` family) + brass/clay/oxblood accents (`#b08947`, `#b6553a`, `#9a2436` family) + espresso near-black text. Banned as the default reach. Rotate alternatives instead: cold luxury (silver + chrome + smoke), forest (deep green + bone + amber), black and tan, cobalt + cream, terracotta + slate, monochrome + one saturated pop. Never ship the same premium-consumer palette twice in a row. Override: the brief explicitly names those colours.
- **Colour consistency lock.** Once an accent is chosen, it is the accent for the WHOLE surface. A warm-grey page does not get a blue CTA in section 7. Audit every component before shipping.
- **Shape consistency lock.** ONE corner-radius system per surface: all-sharp, all-soft (12-16px), or all-pill for interactive. Mixed radii are allowed only under a documented rule ("buttons pill, cards 16px, inputs 8px") applied everywhere.

### Layout tells

- **No three equal feature cards.** The generic "three identical cards in a row" feature section is banned. Use a 2-column zig-zag, asymmetric grid, bento with varied cell sizes, or horizontal scroll.
- **Zigzag alternation cap.** Max 2 consecutive "image one side, text the other" alternating sections. The 3rd consecutive split is a fail. Break with a full-width section, vertical stack, or different layout family.
- **Section-layout repetition ban.** A layout family (3-col cards, full-width quote, split text+image) appears at most ONCE per page. 8 sections need at least 4 distinct layout families.
- **Eyebrow rationing.** The small uppercase wide-tracked label above a section headline (`text-[11px] uppercase tracking-[0.18em]`) is the #1 templated rhythm in AI output. Hard cap: 1 eyebrow per 3 sections, hero counts as 1. If a section has one, the next two do not. Usually the right fix is deleting the eyebrow - the headline alone is enough.
- **Split-header ban.** "Giant left headline + small explainer paragraph floating top-right" as a section header is banned as default. Stack vertically: headline, then body at max-width 65ch.
- **No section-number eyebrows.** `001 · Capabilities`, `06 · How it works`, `00 / INDEX` - banned. Labels name topics in plain language; they do not enumerate.
- **Hero discipline.** Max 4 text elements in a hero: optional eyebrow OR brand strip (not both), headline (max 2 lines desktop), subtext (max 20 words), CTAs (1 primary + max 1 secondary). Trust strips, pricing teasers, feature bullets, and avatar rows move below the hero. CTA visible without scrolling. Logo walls live UNDER the hero, never inside it.

### Content and data tells

- **The Jane Doe effect.** No "John Doe / Sarah Chan" testimonial names, no egg avatars, no "Acme / Nexus / SmartFlow / Cloudly" brand names. Invent locale-appropriate, believable names and specific brands.
- **No fake-precise numbers.** `92%`, `4.1×`, `48k` either come from real data, are explicitly labelled as mock, or are removed. Do not fake engineering precision the product doesn't claim.
- **No div-based fake screenshots.** A fake product UI built from styled `<div>` rectangles (fake task lists, fake terminals, fake dashboards) is the #1 visual tell. Use a real screenshot, a generated image, a real working component preview, or nothing.
- **No scroll cues.** "Scroll to explore", animated mouse icons, `↓ scroll`. The user knows what scroll is.
- **No decorative status dots.** Coloured dots before nav items, list rows, or badges are banned unless the dot conveys real semantic state (live server status, actual availability), max one per section.
- **No locale / weather strips.** "Lisbon 14:23 · 18°C" in headers or footers - banned unless the brief is genuinely about place or distributed-team time zones. A plain contact address in the footer is fine.
- **No pills or labels overlaid on images**, no fake photo-credit captions (`Field study no. 12 · House archive`), no version footers (`v1.4.2`, `Build 0048`) on marketing surfaces, no `BRAND. MOTION. SPATIAL.` decoration strips at the hero bottom.
- **Em-dash ban.** Zero em-dashes (—) and zero en-dashes (–) anywhere user-visible: headlines, body, quotes, captions, buttons, alt text. Ranges use a hyphen. This rule is binary because "use sparingly" has been empirically ignored.

---

## The Motion Decision Framework

Before writing any animation code, answer these questions in sequence. Do not skip to implementation.

### Question 1 — Should this animate at all?

Determine how often a user will trigger this interaction:

| Trigger frequency | Decision |
|---|---|
| 100+ times/day — keyboard shortcuts, command palette, nav toggle | No animation. Remove it. |
| Tens of times/day — hover states, list navigation, tab switching | Reduce or remove |
| Occasional — modals, drawers, toasts, confirmations | Standard animation |
| Rare or first-time — onboarding, empty state first load, celebrations | Can carry more weight |

**Never animate keyboard-initiated actions.** These are repeated hundreds of times daily. Animation here fails R — it makes the interface feel slower than it is, which is a perception problem masquerading as a performance one. Raycast has no open/close animation. That is the correct decision for something used hundreds of times a day.

**CRISP dimension at risk:** R — Responsive. An animation on a frequent interaction is not delight. It is delay.

---

### Question 2 — What is this animation for?

Every motion must pass at least one of these two tests:
- **Clarifies cause & effect** — the animation explains what happened or where something came from (orientation, confirmation, transition)
- **Adds deliberate delight** — the animation creates an intentional emotional moment on a low-frequency surface

If it passes neither test, remove the animation.

Valid purposes:

| Purpose | Example |
|---|---|
| **Spatial orientation** | Toast enters and exits from the same direction — swipe-to-dismiss feels logical because the animation built the mental model |
| **State confirmation** | Button scales on press — the interface confirms it heard the user |
| **State transition** | Morphing feedback icon shows the action completed without a separate confirmation step |
| **Preventing jarring discontinuity** | Element appearing without transition feels broken, not fast |
| **Explanatory** | First-run animation that shows how a feature works |

"It looks refined" is not a valid purpose for an interaction that fires dozens of times per day.

---

### Question 3 — What easing should it use?

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

**Never use ease-in on UI elements.** Ease-in starts slowly. The moment the user takes an action is the moment they are watching most closely. Ease-in delays exactly that moment. A dropdown at 300ms ease-in *feels* slower than the same dropdown at 300ms ease-out — not because of duration, but because of where the motion is.

**Use custom easing curves.** Browser defaults are too weak. They lack the decisiveness that makes motion feel intentional.

```css
/* CRISP motion tokens — from CRISP-STYLE-KIT.md */
--ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.45, 0, 0.55, 1);

/* For drawers and sheet gestures */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

---

### Question 4 — How long should it take?

| Element | Duration |
|---|---|
| Button press feedback | 100–160ms |
| Tooltips, small popovers | 125–200ms |
| Dropdowns, selects | 150–250ms |
| Modals, drawers | 200–500ms |
| Marketing or explanatory motion | May be longer |

**UI animations: stay under 300ms.** A 180ms dropdown feels more responsive than a 400ms one. The spinner that spins faster makes the page feel like it loads faster — even when the load time is identical. Perceived performance is real performance, from the user's point of view.

**CRISP dimension at risk:** R — Responsive. Duration is the most auditable indicator of whether a UI respects the user's time.

---

## Component Craft Rules

These are not suggestions. Each has a CRISP dimension it protects.

---

### Buttons must confirm they were pressed

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

**Fails if absent:** R — the user receives no confirmation the interface registered their press.

---

### Nothing enters from scale(0)

Nothing in the physical world appears from nothing. Elements animating from `scale(0)` look synthetic — they break the spatial logic the user's brain is using to navigate.

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

**Fails if absent:** R — the animation lacks physical logic.

---

### Popovers scale from their trigger

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

**Fails if absent:** C — the user's spatial model is wrong. The popover appears to come from nowhere.

---

### Tooltips: remove delay and animation after first hover

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

**Fails if absent:** R — every subsequent tooltip hover carries animation overhead the user never needed.

---

### Use blur to bridge imperfect crossfades

When two states crossfade and the transition looks like two overlapping objects rather than one thing changing, add `filter: blur(2px)` at the midpoint. Blur prevents the eye from resolving two distinct states as separate objects. Keep blur under `4px` — above that it is expensive, especially in Safari.

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

### Never use `transition: all`

Always list only the properties you intend to animate — typically `opacity` and `transform`. `transition: all` accidentally animates layout-affecting properties (`height`, `width`, `padding`, `margin`) causing reflows and jank on every state change.

```css
/* Fails — animates everything including layout properties */
.btn { transition: all 200ms; }

/* Correct — only what moves */
.btn {
  transition: transform var(--duration-fast) var(--ease-out),
              opacity  var(--duration-fast) var(--ease-out);
}
```

**Fails if present:** R — layout-triggering animations produce jank, which breaks the perception of responsiveness.

---

### Animations must be interruptible

Every animation must be cancellable by user input. An animation that locks out interaction is a cage, not a transition. CSS transitions handle interruption correctly — they retarget mid-animation. Keyframe animations restart from zero and should not block user input.

For gesture-driven interactions, springs are correct precisely because they maintain velocity when interrupted. The animation resolves from wherever it was, not from the beginning.

**Fails if absent:** R — an animation that cannot be interrupted signals the UI is not listening to the user.

---

### Animate entry with @starting-style

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

### Stagger list entries

When multiple elements appear together, stagger them. Everything appearing at once reads as a page refresh. Keep stagger increments short: 30–80ms per item. Stagger is decorative — never block interaction while stagger animations are running.

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

### Asymmetric enter/exit timing

Enter can be measured. Exit must be fast. When a user dismisses something, the system is responding to a clear intent. Delay here is friction.

```css
.drawer { transition: transform 300ms var(--ease-drawer); }
.drawer.is-closing { transition: transform 200ms var(--ease-out); }
```

Apply broadly: enter 300ms, exit 150–200ms. The asymmetry is felt as the interface being fast — not noticed as a design decision.

---

## Behavioral Pattern Craft

These are the interaction patterns most commonly designed wrong. Each has specific engineering decisions that separate craft from boilerplate.

---

### Loading States

Loading is not a moment to hide. It is a moment to maintain user confidence.

**Duration thresholds:**

| Duration | Pattern | Reason |
|---|---|---|
| < 100ms | No indicator | Feels instant — an indicator would flash and disappear, creating noise |
| 100ms–1s | Subtle skeleton | Show structure without implying slowness |
| 1s–10s | Skeleton + optional progress | User is aware they're waiting; give them something to read |
| > 10s | Explicit progress + cancel option | User must always be able to exit a long wait |

**Skeleton rules:**
- Match skeleton shapes to actual content proportions — not generic horizontal bars
- Shimmer direction matches reading direction (left to right in LTR)
- Transition to real content with `opacity: 0 → 1` — never replace-and-pop
- Skeleton and content must share the same layout — no layout shift on resolve

**Progressive loading:**
- Load above-fold content first
- Lazy-load below-fold with `IntersectionObserver`
- Stagger list items on load at 30–50ms intervals (matches the stagger rule above)

**Optimistic UI:**
Show the expected result immediately. Reconcile on server response. Roll back with an undo toast if the action fails — never silently revert.

**CRISP violations:**
- Blank screen with no skeleton → **R** (user receives no feedback the system heard them)
- Spinner on a predictable action (filter, sort, tab switch) → **R** (the system already knows the result)
- Layout shift when skeleton resolves → **R** (the skeleton lied about what was coming)
- No cancel option on a > 10s operation → **P** (user trapped in a wait they can't exit)

---

### Error Handling

The correct hierarchy: prevent → detect → communicate → recover. Most UIs only communicate.

**Prevention (design out errors before they happen):**
- Inline validation before submission — never make the user submit to discover which fields are wrong
- Constraint-based inputs (date pickers, dropdowns, sliders) where free text would produce errors
- Confirmation dialogs on destructive actions; hold-to-confirm for irreversible ones (see `clip-path` hold pattern below)
- Auto-save to prevent data loss on accidental navigation

**Detection:**
- Real-time field validation fires on blur, not on keystroke — keystroke validation is punitive for errors, acceptable for additive feedback (password strength)
- Network timeout detection: surface an error at 15–30s; don't let the user wait indefinitely
- Permission checks before the user tries the action, not after

**Communication — three-part error message:**
1. What happened (brief, factual)
2. Why, if helpful
3. What to do next (specific, actionable)

Never:
- "Something went wrong" — gives the user nothing
- Error codes as the primary message
- Blame language ("You entered an invalid email" → "This email address isn't valid")

Severity levels:
- **Error** — action failed or blocked
- **Warning** — action succeeded but with a consequence the user should know
- **Info** — neutral context, not a problem

**Recovery:**
- Preserve all user input on error — never clear a form on submission failure
- Retry button for transient failures (network errors)
- Auto-retry with exponential backoff for background operations
- Undo toast for actions taken by mistake — 5 seconds to undo, then commit

**CRISP violations:**
- No inline validation, errors only on submit → **S** (user is forced into the form's workflow to discover problems)
- Form cleared on error → **P** (data loss is a power failure — the system punished the user for an error)
- Generic "Something went wrong" → **C** (no orientation — the user doesn't know where they are or what changed)
- No recovery path from an error state → **P** (dead end — the powerful interface always offers a way out)

---

### State Machine Modeling

UI behavior mapped as a finite state machine eliminates impossible states before they reach code. If you cannot draw the state machine for a component, its behavior is implicit in conditionals — and implicit behavior produces states no one designed.

**Components:**
- **States** — distinct modes the UI can be in (`idle`, `loading`, `loaded`, `error`, `empty`, `retrying`)
- **Events** — what triggers transitions (click, submit, timeout, server response)
- **Transitions** — rules for moving between states (`on submit in idle → loading`)
- **Guards** — conditions required for a transition (`isValid`, `hasPermission`, `!isLoading`)

**Common UI machines:**

```
Form:       idle → editing → submitting → success | error → idle
Data:       idle → loading → loaded | error, error → retrying → loaded | error
Auth:       logged-out → authenticating → logged-in → logging-out → logged-out
Multi-step: step1 → step2 → step3 → review → submitting → complete
```

**Design each state as a distinct visual composition** — not a conditional tweak of the default state. Every state the machine can be in is a screen the user might see. If you haven't designed it, a developer will invent it.

**The impossible-state rule:** Name which state combinations cannot coexist (`loading + error`, `empty + loaded`). Impossible states produce undefined UI. Naming them in design prevents them in code.

**Every state needs an exit.** A state with no outgoing transition is a dead end. Users who reach it are stuck.

**CRISP violations:**
- Impossible states (`loading + error` simultaneously) → **S** (the interface contradicts itself)
- Missing intermediate states (no `retrying` state — looks frozen) → **R** (no feedback on what the system is doing)
- Error state with no exit → **P** (the powerful interface always offers a way out)
- States invented by developers because designers didn't spec them → **C** (unknown experience at an undesigned moment)

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

Duplicate the tab list. Style the copy as the active state — different background, different text colour. Clip the copy so only the active tab's region is visible. Animate the clip on tab change.

This produces a colour transition that timing individual colour properties cannot achieve — the text colour shifts cleanly with the background, with no intermediate blended state.

```css
.tabs-active-overlay {
  clip-path: inset(0 calc(100% - var(--active-tab-right)) 0 var(--active-tab-left) round 6px);
  transition: clip-path 200ms var(--ease-out);
}
```

**Fails if absent:** R — individual colour transitions on tab switch read as two separate state changes, not one.

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

**CRISP dimension:** P — destructive actions must require deliberate, sustained intent.

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

Trigger `.is-visible` with `IntersectionObserver` at `{ rootMargin: '-80px' }`. Use `once: true` — the reveal should not replay on scroll-back.

---

## Spring Physics

Springs simulate real physics. They settle rather than stop. They maintain velocity when interrupted. Use them for gesture-driven interactions. Do not use them for standard UI state transitions — they carry overhead inappropriate for frequent interactions.

### Spring configuration

```js
// Readable — Apple's approach
{ type: 'spring', duration: 0.4, bounce: 0.15 }

// More control
{ type: 'spring', stiffness: 300, damping: 30 }
```

Keep bounce below 0.25 for product UI. Reserve higher values for onboarding or explicitly playful contexts.

### Mouse-tracking with spring interpolation

Tying visual changes directly to mouse position feels artificial — it lacks inertia. Use `useSpring` to interpolate the value.

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

**Fails if absent:** S — the interaction has a hard wall where physics should be.

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

## Component Philosophy

These principles apply when building components that others will use — not just one-off interfaces.

### Zero-configuration default

The component must work correctly with no configuration. One import, one render, correct behaviour. Every required configuration step is a barrier most users will not cross.

**CRISP dimension:** S — friction in the developer interface becomes friction in the user interface.

### Defaults are the product

Most users never change defaults. The default easing, timing, and behaviour *are* the product for the majority of people who install it. Ship defaults that are correct, not defaults that are safe.

**CRISP dimension:** I — a component with poor defaults ships poor defaults to every product that installs it.

### Handle edge cases invisibly

The cases users never encounter consciously matter most in aggregate. Every one of these is invisible when correct and visible when wrong:

- Pause timers when the browser tab is hidden — `document.addEventListener('visibilitychange', ...)`
- Fill gaps between stacked toast elements with pseudo-elements to maintain hover state continuity
- Capture pointer events during drag to prevent state loss when the pointer leaves bounds
- Ignore subsequent touch points after drag begins to prevent position jumps on finger switch
- Debounce rapid state changes to prevent animation collisions on fast interaction

### Match the motion to the personality

A 150ms sharp ease-out is correct for a dashboard action row. The same values feel cold in an onboarding flow. Choose durations and easing that fit the emotional register of the surface — not values that are technically defensible in isolation. The motion should not create a contradiction with what the surface is for.

---

## Performance Rules

### Animate transform and opacity only

`transform` and `opacity` bypass layout and paint and run on the GPU. Animating `padding`, `height`, `width`, or `margin` triggers the full rendering pipeline. Every animated property that is not `transform` or `opacity` is a performance violation until proven otherwise.

**Fails:** R — a janky animation is the opposite of feeling instant.

### Do not update CSS variables inside gesture handlers

CSS variables on a parent recalculate styles for all children. Updating `--drag-offset` on a container during `pointermove` recalculates every child on every frame.

```js
// Recalculates all children — fails P
element.style.setProperty('--drag-offset', `${distance}px`);

// Correct — only affects this element
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

## Mechanical Pre-Flight Checks

Run these before declaring any Brand-register surface done. Each check is countable or grep-able - it cannot be fudged by judgment. If a single check fails, the output is not done.

| # | Check | How to verify |
|---|---|---|
| 1 | Zero em-dashes or en-dashes user-visible | `grep -n '—\|–'` over markup and copy. Count must be 0. |
| 2 | Eyebrow count ≤ ceil(sections / 3) | Count `uppercase tracking` micro-labels above headlines. Hero counts as 1. |
| 3 | Max 2 consecutive zigzag sections | Count consecutive image+text-split sections. 3+ in a row fails. |
| 4 | ≥ 4 layout families per 8 sections | List each section's layout family; no family twice. |
| 5 | No CTA label wraps at desktop | Render at 1280px; every button label is one line. |
| 6 | No duplicate CTA intent | Group CTAs by intent (contact / signup / portfolio). One label per intent across nav, hero, footer. |
| 7 | One accent colour page-wide | List every accent usage; all resolve to the same token. |
| 8 | One corner-radius system | List every radius; all conform to the documented rule. |
| 9 | Every CTA passes WCAG AA contrast | Check button text vs button background: 4.5:1 body, 3:1 large. White-on-white and ghost-over-photo without scrim fail. |
| 10 | Hero fits initial viewport | Headline ≤ 2 lines, subtext ≤ 20 words, CTA visible without scroll, top padding ≤ 6rem. |
| 11 | No banned serif as default | If serif display is used, it is not Fraunces or Instrument Serif without explicit brand justification. |
| 12 | No premium-consumer default palette | If the brief is premium-consumer, the palette is not beige + brass + espresso. |
| 13 | No div-based fake screenshots | Every product preview is a real image, generated image, or working component. |
| 14 | No fake-precise numbers | Every statistic is sourced, labelled mock, or removed. |
| 15 | Reduced motion honoured | Every transform-based animation degrades under `prefers-reduced-motion`. |

**Authoring note:** when adding rules to this skill, phrase them in this binary, countable form. "Avoid X" and "use X sparingly" are empirically ignored during generation; "max N per page, count them" is not.

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
| Same enter/exit duration | Enter 300ms, exit 150ms | R | Exit responds to clear intent — must be immediate |
| No hover state guard | `@media (hover: hover) and (pointer: fine)` | S | Touch devices trigger hover on tap |
| Framer Motion `x`/`y` on frequently animated element | `transform: 'translateX()'` string | R | Shorthand drops frames under main thread load |
| `setProperty('--drag-offset')` in gesture handler | `element.style.transform` directly | P | CSS variable update recalculates all children every frame |
| No pointer capture on drag start | `element.setPointerCapture(e.pointerId)` | S | Drag breaks when pointer leaves element bounds |
| Timer continues when tab hidden | `visibilitychange` handler pauses timer | S | Timer dismisses element the user never saw |

---

## Debugging Craft Violations

### Test at reduced speed

Before calling a component done, test its animations at 5× duration. Issues invisible at full speed become obvious in slow motion: incorrect easing, wrong `transform-origin`, properties that go out of sync, overlapping states during crossfades.

### Test on real devices

For gesture interactions, test on physical hardware. Simulator gesture behaviour is not representative. Connect via USB, visit the local dev server by IP, use remote devtools. What feels smooth on desktop drops frames on device.

### Review the next day

Timing issues invisible during development become obvious with distance. What felt "slightly slow" the day before reads as "clearly slow" the day after. Review animations with fresh eyes before shipping.

---

## Accessibility

### prefers-reduced-motion

Reduced motion means fewer and gentler animations — not zero. Preserve opacity and colour transitions that aid comprehension. Remove all transform-based motion.

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

**Fails if absent:** S — ignoring a system preference is a seamlessness failure, not just an audit item.

### Touch device hover guard

```css
@media (hover: hover) and (pointer: fine) {
  .element:hover { background: var(--surface-2); }
}
```

Touch devices fire `:hover` on tap. Without this guard, hover animations misfire on every tap.

---

## CRISP Token Integration

Use motion tokens from `CRISP-STYLE-KIT.md` as implementation ground truth. Do not introduce alternatives.

```css
--ease-out:        cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out:     cubic-bezier(0.45, 0, 0.55, 1);
--duration-fast:   150ms;
--duration-base:   300ms;
--duration-slow:   500ms;
--duration-thread: 800ms;  /* Lineage timeline only */
```

`--duration-thread` is the one case where 800ms is correct — the lineage timeline draw is structural, not interactive. Every other UI interaction observes the 300ms ceiling.

**No decorative motion.** If removing the animation does not change what the user understands, remove it.

---

## What This Skill Does Not Do

- Does not evaluate visual design — that is `/crisp-audit` or `/crisp-review`
- Does not score against CRISP dimensions — that is `/crisp-audit`
- Does not generate design specifications — that is `/handoff`
- Does not introduce tokens outside the CRISP style kit
- Does not add animation because it looks refined — only because it repairs R, S, C, or P

---

## Relationship to Other CRISP Skills

```
/crisp-teach      →  writes .crisp.md (run first, once per project)
/crisp-research   →  research synthesis, competitive patterns
/crisp-review     →  30-second audit, grade + top 3 issues
/crisp-audit      →  full scored evaluation across all 5 dimensions
/crisp-design-eng →  THIS SKILL: craft layer — motion, micro-interaction, invisible polish
/handoff          →  developer-ready spec from reviewed design
```

Craft violations identified here should be resolved before a component enters `/handoff`. They are R and S failures at the implementation level — not aesthetic preferences.

---

## Output Format

```
/crisp-design-eng: [Component or Interaction Name]
─────────────────────────────────────────────────────

CRAFT VIOLATIONS

| Before | After | CRISP | Why |
|---|---|---|---|
| [specific code] | [specific fix] | [dimension] | [one line] |

─────────────────────────────────────────────────────

MOTION DECISIONS

[What animates · duration · easing · purpose — one line per element]

─────────────────────────────────────────────────────

EDGE CASES

[Pointer capture · multi-touch · visibility pause · hover guard — as applicable]

─────────────────────────────────────────────────────

PERFORMANCE FLAGS

[GPU / layout / recalc issues identified]

─────────────────────────────────────────────────────

ACCESSIBILITY

[Reduced motion handling · touch device guards]

─────────────────────────────────────────────────────

[Context flags — .crisp.md absent · tokens not found]

— Ready for /handoff
```

---

*CRISP Design Engineering Skill — getcrisp.design*
*Part of the CRISP skill pack · github.com/laith-wallace/crisp*
*Install: `npx skills add laith-wallace/crisp`*
*Craft philosophy informed by Emil Kowalski · animations.dev*
