---
id: risograph-zine
name: Risograph Zine
thesis: Two spot inks, slightly out of register, on cheap paper; energy from constraint, not effects.
inspiration: Risograph-printed zines and gig flyers, fluorescent pink overprinted on blue
registers: [brand]
fights:
  - off-brand purple-blue gradient
  - glow halo
  - SaaS cream with generic sans
tokens:
  colors:
    bg: "oklch(0.97 0.012 90)"
    surface: "oklch(0.94 0.016 90)"
    ink: "oklch(0.33 0.13 265)"
    muted: "oklch(0.45 0.08 265)"
    accent: "oklch(0.55 0.23 0)"
    on-accent: "oklch(0.99 0.005 90)"
    fill-pink: "oklch(0.76 0.16 355)"
    fill-yellow: "oklch(0.9 0.15 100)"
  typography:
    display:
      family: Bricolage Grotesque
      weight: 800
      source: google
    text:
      family: Work Sans
      weight: 400
      source: google
    base: 16px
    scale: 1.5
  radius: 0px
  spacing: 8px
  density: 5
  motion: Playful but rare. A 2px registration shift on hover for the hero art; otherwise still.
  depth: Overprint, not shadow. Layers are flat ink shapes that multiply where they overlap.
---

## Layout grammar

Big, loosely gridded blocks. A headline that runs off the edge or breaks over three lines, a flat colour shape behind it, and body copy in a narrow column. Images are duotone: blue ink plus pink, never full colour.

## Signature moves

1. Every page uses only blue ink and fluorescent pink, with yellow as a rare third pass; overlaps are rendered with `mix-blend-mode: multiply`.
2. Headline shapes offset 2 to 4px from their colour block, like a misregistered second pass.
3. Grain on flat fills via a tiny inline SVG noise, kept under 4% opacity so text stays crisp.

## Avoid

- Gradients of any kind. Riso has spot inks, not ramps.
- Pink text at small sizes; pink is a fill and a headline colour, blue carries reading.
- Using it for dense product UI, because the energy fights forms and tables.

## In product UI

Brand register first. Inside a product it suits a single moment: an onboarding screen, an empty state, a launch page or a year-in-review. Keep the app shell in ink-on-paper and let one riso panel carry the personality.
