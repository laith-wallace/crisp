---
id: departure-board
name: Departure Board
thesis: Live status reads like a split-flap board, where every row is a fact that changes in place.
inspiration: Solari split-flap departure boards in 1970s European airport and rail halls
registers: [product, brand]
fights:
  - fintech blue gradient
  - hero metric template
  - glassmorphism dark dashboard
tokens:
  colors:
    bg: "oklch(0.2 0.015 255)"
    surface: "oklch(0.25 0.018 255)"
    ink: "oklch(0.95 0.012 90)"
    muted: "oklch(0.75 0.02 255)"
    accent: "oklch(0.84 0.15 82)"
    on-accent: "oklch(0.2 0.015 255)"
    delayed: "oklch(0.74 0.15 35)"
    line: "oklch(0.34 0.02 255)"
  typography:
    display:
      family: Handjet
      weight: 600
      source: google
    text:
      family: Barlow
      weight: 400
      source: google
    mono:
      family: Azeret Mono
      weight: 500
      source: google
    base: 15px
    scale: 1.25
  radius: 2px
  spacing: 8px
  density: 8
  motion: Stepped character flips of 60 to 90 ms when a value changes; nothing else moves.
  depth: Flat panels on a dark field, separated by 1px rules and a 2px gap between flap cells. No shadows.
---

## Layout grammar

Full-width rows on a fixed column grid: time, destination, detail, status. Columns never reflow mid-row; on narrow screens the least important column drops out whole. Headings sit in a thin header band above the board, never inside it. The board is the page.

## Signature moves

1. Values sit in tiled cells with a 2px gap, as if each character were a flap, and update with a short stepped flip only when the data changes.
2. Status words are the only colour: amber for boarding or active, a warm red for delayed, ink for everything else.
3. Tabular mono figures for every time and count, so columns align to the digit.

## Avoid

- Flipping for decoration. A flip is a state change; an idle board is still.
- Rounded cards. Rows on a field, not cards on a page.
- More than two status colours on one screen, because the board stops being scannable.

## In product UI

A dashboard becomes a board of rows: jobs, deploys, orders or shipments with status in the last column, sorted by time. Settings render as a two-column list (label, current value) with the value in mono; editing opens an inline row, not a modal. Best for operations, logistics, incident and queue views where change over time is the story.
