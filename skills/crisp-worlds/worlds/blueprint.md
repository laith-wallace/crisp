---
id: blueprint
name: Blueprint
thesis: Show the system as a drawing set, with title blocks, dimension lines and sheet numbers, so complexity looks engineered.
inspiration: Architectural and engineering blueprint drawing sets with title blocks and revision clouds
registers: [product, brand]
fights:
  - glassmorphism dark dashboard
  - off-brand purple-blue gradient
  - glow halo
tokens:
  colors:
    bg: "oklch(0.33 0.08 258)"
    surface: "oklch(0.37 0.08 258)"
    ink: "oklch(0.97 0.01 240)"
    muted: "oklch(0.84 0.04 240)"
    accent: "oklch(0.89 0.12 92)"
    on-accent: "oklch(0.28 0.07 258)"
    line: "oklch(0.55 0.07 250)"
  typography:
    display:
      family: Saira Semi Condensed
      weight: 600
      source: google
    text:
      family: Red Hat Text
      weight: 400
      source: google
    mono:
      family: Red Hat Mono
      weight: 400
      source: google
    base: 14px
    scale: 1.25
  radius: 0px
  spacing: 8px
  density: 7
  motion: Drawn. Lines and diagrams draw on once over 400 ms with a linear stroke; content never floats.
  depth: Line work only. Thin white strokes on the blue field, a faint 24px grid, and a framed title block.
---

## Layout grammar

Every view is a sheet: a thin outer frame, a title block in the bottom right (sheet name, number, revision, date), and the drawing in the field. Diagrams use dimension lines with arrowheads and labels. Notes are numbered and listed in a column beside the drawing.

## Signature moves

1. A title block on each screen with sheet number and revision, which doubles as the page's metadata.
2. Dimension and leader lines connecting labels to parts of a diagram, instead of tooltips.
3. Pale yellow, like a reviewer's pencil, marks changes and the primary action, the way a revision cloud marks an edit.

## Avoid

- Glowing lines or neon. A blueprint is matte.
- Using the blue field for long-form reading; keep paragraphs short or on a light sheet.
- Fake handwritten fonts for annotations.

## In product UI

Architecture diagrams, infrastructure, CAD, robotics and systems tools. A dashboard becomes a sheet with the system diagram in the field and the status list as numbered notes. Settings sit in a light-mode sheet variant (white field, blue lines) so forms stay readable.
