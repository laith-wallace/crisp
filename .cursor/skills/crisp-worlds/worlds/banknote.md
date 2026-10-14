---
id: banknote
name: Banknote
thesis: Trust through craft, with fine engraved line work, serial numbers and deep inks, instead of a blue gradient.
inspiration: Intaglio-printed banknotes with guilloche patterns, engraved portraits and serial numbers
registers: [brand, product]
fights:
  - fintech blue gradient
  - hero metric template
  - glow halo
tokens:
  colors:
    bg: "oklch(0.95 0.02 120)"
    surface: "oklch(0.975 0.012 120)"
    ink: "oklch(0.27 0.04 160)"
    muted: "oklch(0.44 0.04 150)"
    accent: "oklch(0.42 0.08 50)"
    on-accent: "oklch(0.975 0.012 120)"
    line: "oklch(0.8 0.04 160)"
    fill-guilloche: "oklch(0.84 0.05 180)"
  typography:
    display:
      family: Cinzel
      weight: 600
      source: google
    text:
      family: Source Sans 3
      weight: 400
      source: google
    base: 15px
    scale: 1.333
  radius: 4px
  spacing: 8px
  density: 6
  motion: Minimal and precise. A guilloche pattern can draw on once over 800 ms; numbers never animate.
  depth: Engraved. Fine-line patterns and borders create texture; no blur, no drop shadows.
---

## Layout grammar

Framed panels with fine engraved borders, a guilloche rosette or band as the one ornamental element, and figures set large in a fielded layout. Serial-style identifiers (account numbers, references) are prominent and spaced in groups.

## Signature moves

1. One guilloche pattern (generated as inline SVG line work) behind the hero or a balance panel, at low contrast.
2. Engraved roman caps for headings, used only at display sizes; text stays a clear sans.
3. Grouped serial numbers (4-4-4) for references, so they read like a note's serial.

## Avoid

- Gradients and glossy cards; the trust comes from line work.
- Engraved caps in body text or labels, because they slow reading.
- More than one ornament per screen.

## In product UI

Fintech, banking, payments, insurance and treasury. A dashboard puts the balance in an engraved panel with the guilloche at low contrast, then plain tables. Settings stay plain sans forms; account and card details use the grouped serial format.
