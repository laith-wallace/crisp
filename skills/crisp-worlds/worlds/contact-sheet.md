---
id: contact-sheet
name: Contact Sheet
thesis: Show everything at once in strict frames, then mark the keepers with a grease pencil.
inspiration: Photographers' contact sheets on a lightbox, with frame numbers and red grease-pencil selections
registers: [product, brand]
fights:
  - identical card grid
  - decorative motion
  - glassmorphism default
tokens:
  colors:
    bg: "oklch(0.97 0.003 90)"
    surface: "oklch(0.92 0.003 90)"
    ink: "oklch(0.18 0 0)"
    muted: "oklch(0.44 0 0)"
    accent: "oklch(0.52 0.2 28)"
    on-accent: "oklch(0.99 0 0)"
    line: "oklch(0.25 0 0)"
  typography:
    display:
      family: Oswald
      weight: 500
      source: google
    text:
      family: Schibsted Grotesk
      weight: 400
      source: google
    base: 14px
    scale: 1.25
  radius: 0px
  spacing: 4px
  density: 8
  motion: Immediate. Selection marks draw in 120 ms; frames never zoom on hover.
  depth: Frames on a lightbox. Black frame borders on a bright field; nothing floats.
---

## Layout grammar

A strict grid of equal frames with thin black borders, each numbered along the bottom edge like film stock. Strips run in rows. Selecting a frame circles or crosses it in red rather than adding a checkbox overlay. A loupe view opens the selected frame large beside the sheet.

## Signature moves

1. Frame numbers in small condensed caps along each strip edge, with a strip label at the start of each row.
2. Grease-pencil red selections: a hand-drawn-style circle or tick drawn in SVG on chosen frames.
3. A loupe panel that shows the chosen frame large with its metadata, without leaving the sheet.

## Avoid

- Rounded thumbnails and hover zoom.
- Gaps wider than the frame border; the sheet is tight.
- Red for anything except selection, because the grease pencil means "keep".

## In product UI

Asset managers, design review, photo and video tools, moderation queues and any bulk-selection task. The dashboard is the sheet; bulk actions appear in a bar once something is marked. Settings sit in the loupe panel.
