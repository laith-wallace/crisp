# Award-Level Landing Pages - `/crisp-design-eng` reference

Load this file when building or reviewing a marketing or landing page that should be good enough to submit to the Awwwards directory (or any design award). The rules here are binding for that work.

The Mechanical Pre-Flight Checks in `SKILL.md` are the floor. This file is the bar above it: a page can pass all eleven checks and still look like a template.

---

## What the jury scores

Awwwards juries score four things. Weight your effort the same way:

| Criterion | Weight | What it means in practice |
|---|---|---|
| Design | 40% | Art direction, type, colour, layout, imagery. Does it look authored, not assembled? |
| Usability | 30% | Speed, clarity, navigation, mobile, accessibility. Does it work for everyone? |
| Creativity | 20% | One idea nobody else has. A signature moment the visitor remembers. |
| Content | 10% | Real, specific copy and imagery. Nothing generic, nothing placeholder. |

A page that is clean but generic scores a 6. Award pages score 7.5+ because of Design and Creativity. Usability failures sink a page even when it is beautiful.

---

## Step 1 - Art direction before pixels

Write these three lines before any code. If you cannot, stop and ask for the missing input.

1. **Scene sentence** (from `references/color-typography.md`): who visits, where, on what device, in what mood. It must force light vs dark by itself.
2. **Concept**: one sentence naming the single idea the page is built around. "A spec sheet that reads like a race programme" is a concept. "Modern and clean" is not.
3. **Signature moment**: the one thing the visitor will remember. Examples: the hero headline is set in the product's own material; the process scrolls as a sticky three-step story; the pricing is a dial, not a table.

**Never inherit the CRISP brand look for client work.** The CRISP tokens (near-black with lime accent, DM Serif Display) are CRISP's own identity. A client page that falls back to them is a P failure: it tells the visitor nothing about the client. Derive palette and type from the client's scene sentence.

---

## Step 2 - The design rules

### Typography carries the page

- One display face with real character, one quiet text face. Pick both with the font procedure in `references/color-typography.md`. Reflex-reject fonts are still banned.
- Hero headline: `clamp()` from about 2.5rem on phones to 5rem+ on desktop. Tight tracking (-0.02em to -0.04em) and `text-wrap: balance`.
- Type scale ratio of at least 1.333 between levels. Fewer sizes, bigger jumps.
- Body copy 16px minimum, 60-70 characters per line.

### Layout has intent

- Build on a 12-column grid, then break it on purpose once per page (an oversized headline that bleeds, an offset image, a full-bleed band).
- Asymmetric hero: copy on one side, a real visual on the other. Never a centred headline over a stock photo.
- Generous space: section padding of 96-160px on desktop. Space is a design material, not leftover.
- At most two eyebrow labels per page (pre-flight check 2). Use numbering, rules or scale for hierarchy instead.

### Imagery is real or authored

- Real photography of the client's product, place or people, art-directed with one consistent treatment (grade, crop ratio, grain).
- If there is no photography: custom illustration, a typographic composition, a product spec card built from real content, or a CSS/SVG graphic made for this page. Never stock photos of people pointing at laptops.
- Every content image: descriptive `alt`, explicit `width`/`height` (no layout shift), modern format (AVIF/WebP), `loading="lazy"` below the fold.

### Colour commits

- Pick a commitment level (`references/color-typography.md`, Step 1). Marketing pages are usually Committed or Full palette, not Restrained.
- OKLCH tokens, no pure black or white, one accent reserved for actions.
- Text passes WCAG AA (4.5:1). The CTA label passes 4.5:1 on its fill.

---

## Step 3 - Motion that earns its place

Award pages move. They move with purpose. Every rule in the Motion Decision Framework still applies.

- **Scroll reveals:** fade + 16-24px rise, 500-700ms, `--ease-out`, staggered 60-80ms across siblings. Content is never hidden without JavaScript (gate the hidden state behind a `.js` class) and never hidden under `prefers-reduced-motion: reduce`.
- **One signature interaction**, not five. Pick one: sticky scroll story, marquee of proof, magnetic CTA, cursor-following highlight, image reveal with `clip-path` (`references/motion-recipes.md`).
- **Hover and press:** every interactive element answers within 100ms. Buttons press to `scale(0.97-0.98)`. Hover effects only behind `@media (hover: hover)`.
- **Performance budget:** LCP < 2.5s, CLS < 0.1, INP < 200ms on a mid-range phone. Animate `transform` and `opacity` only (`references/performance.md`). A slow award page is a usability fail.

---

## Step 4 - The details juries notice

- Custom `::selection` colour from the palette.
- Visible `:focus-visible` ring on every interactive element.
- Favicon, Open Graph image (1200x630) and a page title written for humans.
- A designed 404 page and empty or loading states, if the site has them.
- Smooth anchor scrolling, with `scroll-behavior: auto` under reduced motion.
- Footer that finishes the page: brand, one CTA, legal links. Not an afterthought.

---

## Award Pre-Flight (run after the Mechanical Pre-Flight Checks)

Every check is countable. All ten must pass before submitting.

| # | Check | Pass condition |
|---|---|---|
| A1 | Art direction written | Scene sentence, concept and signature moment exist in the brief or PR |
| A2 | No inherited brand | 0 CRISP brand tokens (lime accent, CRISP dark background) on client pages |
| A3 | Real content | 0 lorem ipsum, 0 bracketed placeholders, 0 placeholder testimonials |
| A4 | Authored imagery | 0 generic stock photos; every content image has descriptive `alt` |
| A5 | Signature moment | Exactly 1 named signature interaction, with a reduced-motion fallback |
| A6 | Type scale | Hero headline >= 2.5rem on a 375px phone; scale ratio >= 1.333 |
| A7 | Core Web Vitals | LCP < 2.5s, CLS < 0.1, INP < 200ms (Lighthouse mobile or field data) |
| A8 | Accessibility | Lighthouse accessibility >= 95; keyboard reaches every CTA |
| A9 | Live and indexable | Public URL on the client's own domain; no `noindex`; valid HTTPS |
| A10 | Share-ready | Favicon, OG image, title and meta description present |

Report as one line: `Award pre-flight: 10/10 pass`, or list each failure with the fix.

**Draft pages generated by a pipeline usually fail A3 and A9 on purpose**: they carry placeholder proof and a `noindex` tag until a human signs them off. Replace the placeholders with real proof, move the page to the client's domain and remove `noindex` before submitting.
