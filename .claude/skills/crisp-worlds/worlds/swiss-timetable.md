---
id: swiss-timetable
name: Swiss Timetable
thesis: A strict grid, one red, and numbers that line up to the digit; order is the aesthetic.
inspiration: 1970s Swiss federal railway printed timetables and station clocks
registers: [product, brand]
fights:
  - SaaS cloud beige
  - centred three-card stack
  - icon tile stack
tokens:
  colors:
    bg: "oklch(0.98 0.002 100)"
    surface: "oklch(0.955 0.003 100)"
    ink: "oklch(0.2 0 0)"
    muted: "oklch(0.45 0.005 100)"
    accent: "oklch(0.54 0.21 27)"
    on-accent: "oklch(0.99 0 0)"
    line: "oklch(0.2 0 0)"
  typography:
    display:
      family: Hanken Grotesk
      weight: 700
      source: google
    text:
      family: Hanken Grotesk
      weight: 400
      source: google
    base: 15px
    scale: 1.333
  radius: 0px
  spacing: 8px
  density: 8
  motion: Almost none. Instant state changes, or a 120 ms linear fade at most, like a clock hand stepping.
  depth: Completely flat. Heavy 2px rules above sections and thin 1px rules between rows carry the hierarchy.
---

## Layout grammar

A 12-column grid with a wide left gutter for section labels, set flush left, ragged right. Every block starts on a column line. Section headings sit to the left of their content, not above it, the way a timetable puts the line number beside the stops.

## Signature moves

1. A heavy black rule above each section, thin rules between rows, and no boxes anywhere.
2. Tabular figures and right-aligned numbers in every column, so times and totals read down the page.
3. One red, used for the single most important thing on screen: the current time, the primary action, or an alert. Never decoration.

## Avoid

- Centring anything. Everything hangs from the left edge of a column.
- Icons as decoration. A word or a number is clearer.
- A second accent colour, because red loses its meaning the moment it has company.

## In product UI

Dashboards become tables first and charts second; a chart earns its place only when the trend matters more than the number. Settings are a two-column form: label in the left gutter, control in the content column, help text in muted below. Ideal for B2B admin, finance, scheduling and anything where people compare rows.
