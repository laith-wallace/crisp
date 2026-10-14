---
id: ledger-book
name: Ledger Book
thesis: Money is written in ruled columns, right-aligned, with red only for what is owed.
inspiration: Bound accounting ledgers with green-tinted paper, ruled money columns and red negative entries
registers: [product]
fights:
  - fintech blue gradient
  - hero metric template
  - glassmorphism default
tokens:
  colors:
    bg: "oklch(0.965 0.02 140)"
    surface: "oklch(0.98 0.012 140)"
    ink: "oklch(0.24 0.02 250)"
    muted: "oklch(0.44 0.02 200)"
    accent: "oklch(0.42 0.12 255)"
    on-accent: "oklch(0.98 0.01 140)"
    negative: "oklch(0.5 0.18 25)"
    line: "oklch(0.8 0.05 150)"
  typography:
    display:
      family: Zilla Slab
      weight: 600
      source: google
    text:
      family: Public Sans
      weight: 400
      source: google
    base: 15px
    scale: 1.25
  radius: 2px
  spacing: 4px
  density: 9
  motion: Quiet. Totals update with no count-up animation; a changed cell flashes a pale wash for 400 ms.
  depth: Ruled lines only. Pale green horizontal rules and double rules under totals.
---

## Layout grammar

Tables are the primary layout: date, description, reference, then money columns right-aligned with tabular figures. A heavier double rule sits under every total. Headings use the slab display sparingly, at the top of a page and over each account.

## Signature moves

1. Tabular, right-aligned figures with the currency symbol in its own narrow column, so decimals line up.
2. Red is reserved for negative values and overdue items; everything else is blue-black ink.
3. Double rules beneath totals and single pale-green rules between rows.

## Avoid

- Giant hero numbers with sparkline confetti. Numbers live in their columns.
- Count-up animations on money, which make figures look unstable.
- Using red for anything but negative or overdue amounts.

## In product UI

Finance, billing, invoicing, payroll and accounting. The dashboard is a set of short ledgers (cash, receivables, payables) with totals; charts sit below, not above. Settings are ruled two-column rows. The calmest answer to fintech gradients.
