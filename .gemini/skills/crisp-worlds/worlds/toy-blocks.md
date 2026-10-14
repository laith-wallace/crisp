---
id: toy-blocks
name: Toy Blocks
thesis: Chunky, rounded, primary and stackable; it feels safe to press anything.
inspiration: Wooden alphabet blocks and stacking toys painted in flat primary colours
registers: [brand]
fights:
  - SaaS cream with generic sans
  - glow halo
  - template copy
tokens:
  colors:
    bg: "oklch(0.97 0.02 95)"
    surface: "oklch(0.99 0.01 95)"
    ink: "oklch(0.25 0.04 270)"
    muted: "oklch(0.45 0.04 270)"
    accent: "oklch(0.5 0.17 260)"
    on-accent: "oklch(0.99 0.01 95)"
    fill-red: "oklch(0.66 0.2 28)"
    fill-yellow: "oklch(0.88 0.16 95)"
    fill-green: "oklch(0.76 0.17 145)"
  typography:
    display:
      family: Fredoka
      weight: 600
      source: google
    text:
      family: Nunito
      weight: 400
      source: google
    base: 17px
    scale: 1.333
  radius: 20px
  spacing: 8px
  density: 3
  motion: Bouncy only where state changes. A pressed block squashes 4% and returns in 200 ms; nothing loops.
  depth: Chunky. Blocks have a solid 4px bottom edge in a darker shade, like painted wood, and no blur shadows.
---

## Layout grammar

Big, stacked blocks of colour that hold content, set on a loose grid with generous gutters. Buttons are blocks too, with a solid bottom edge that compresses on press. Headlines are short, rounded and large.

## Signature moves

1. Solid bottom edges (4px darker shade) on buttons and cards that disappear on press.
2. Primary fills used as whole blocks, each section a different colour, with dark text on top.
3. Rounded display type with friendly, short headlines.

## Avoid

- Thin lines and small text, which feel fragile here.
- White text on yellow or green fills (fails contrast); text on fills is always dark ink.
- Bounce on things that did not change state.

## In product UI

Brand register: kids, education, family and consumer apps. In a product, chunky buttons and coloured section blocks work for onboarding and rewards; keep data views calm and use the fills only as category colours.
