---
id: record-sleeve
name: Record Sleeve
thesis: Type is the image; huge condensed letters cropped by the frame give a page rhythm like a horn section.
inspiration: 1950s and 1960s modern jazz LP sleeves with cropped condensed type and duotone photographs
registers: [brand]
fights:
  - centred three-card stack
  - hero pill badge
  - glow halo
tokens:
  colors:
    bg: "oklch(0.19 0.01 60)"
    surface: "oklch(0.25 0.012 60)"
    ink: "oklch(0.95 0.015 90)"
    muted: "oklch(0.76 0.015 80)"
    accent: "oklch(0.78 0.11 230)"
    on-accent: "oklch(0.19 0.01 60)"
    fill-duotone: "oklch(0.45 0.14 255)"
  typography:
    display:
      family: Anton
      weight: 400
      source: google
    text:
      family: Libre Franklin
      weight: 400
      source: google
    base: 16px
    scale: 1.618
  radius: 0px
  spacing: 8px
  density: 4
  motion: Rhythmic, not decorative. Blocks of type slide in on scroll with a 250 ms ease-out, staggered like a count-in, once only.
  depth: Flat ink on a dark sleeve. Duotone photo blocks sit edge to edge with type; no shadows.
---

## Layout grammar

A square-feeling composition: big blocks of condensed type that run to the edge and get cropped by it, a duotone photo block, and small text set in tight columns. Credits-style lists (who, what, when) replace feature cards.

## Signature moves

1. Display type at 12 to 20vw, cropped by the viewport edge, mixed with small text for contrast in scale.
2. Duotone photographs (dark plus one blue) rather than full colour.
3. A liner-notes column: a narrow, long-form text column with credits set as a list.

## Avoid

- Many sizes in between. Very big and small, nothing medium.
- Using it on light backgrounds without changing the accent, because the blue fails contrast on light.
- Cropping words so far that the name is unreadable.

## In product UI

Brand register: music, events, culture, media and launches. In an app, keep it to profile headers, release pages and editorial moments; the app chrome stays plain and dark with the same blue for actions.
