---
id: thermal-receipt
name: Thermal Receipt
thesis: One narrow column, itemised and totalled, so a transaction reads top to bottom with nothing hidden.
inspiration: Restaurant kitchen tickets and till receipts printed on thermal paper, with a carbon-copy stamp
registers: [product, brand]
fights:
  - fintech blue gradient
  - centred three-card stack
  - nested cards
tokens:
  colors:
    bg: "oklch(0.91 0.004 90)"
    surface: "oklch(0.985 0.003 90)"
    ink: "oklch(0.2 0 0)"
    muted: "oklch(0.4 0.003 90)"
    accent: "oklch(0.42 0.14 275)"
    on-accent: "oklch(0.985 0.003 90)"
    line: "oklch(0.55 0.003 90)"
  typography:
    display:
      family: Sometype Mono
      weight: 700
      source: google
    text:
      family: Sometype Mono
      weight: 400
      source: google
    base: 14px
    scale: 1.2
  radius: 0px
  spacing: 8px
  density: 7
  motion: Printed. New lines feed in from the top over 120 ms in steps; totals never count up.
  depth: A single paper strip on a grey counter, with a faint shadow under the strip only and dashed tear lines inside it.
---

## Layout grammar

One narrow column, 36 to 48 characters wide, centred on a counter-grey field. Items are lines with the label left and the amount right, joined by dot leaders. Dashed rules split sections; the total is in bold caps under a double rule. On wide screens a second strip can sit beside the first, never a grid.

## Signature moves

1. Dot leaders between label and value, with tabular figures right-aligned.
2. Dashed tear lines between sections, and the total in bold caps under a double rule.
3. A carbon-violet stamp for status (PAID, SENT, VOID), the only colour on the strip.

## Avoid

- Card grids. Everything is a line on the strip.
- Wide layouts, because the narrow strip is the point.
- Faking thermal fade or crumpled paper; the format is enough.

## In product UI

Checkouts, orders, POS, invoices, expense items, build logs and activity feeds. An order detail page is a receipt. A dashboard can be a row of strips (today, this week, this month). Settings stay a narrow single column of line items with values right-aligned.
