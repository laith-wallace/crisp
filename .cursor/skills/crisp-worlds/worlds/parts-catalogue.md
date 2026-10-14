---
id: parts-catalogue
name: Parts Catalogue
thesis: Maximum information per square inch, with line drawings, spec tables and filters, because the buyer knows what they need.
inspiration: Industrial supply catalogues with dense spec tables, line drawings and part numbers
registers: [product]
fights:
  - hero metric template
  - identical card grid
  - centred three-card stack
tokens:
  colors:
    bg: "oklch(0.96 0.012 95)"
    surface: "oklch(0.985 0.005 95)"
    ink: "oklch(0.2 0.005 95)"
    muted: "oklch(0.43 0.008 95)"
    accent: "oklch(0.45 0.11 145)"
    on-accent: "oklch(0.99 0.003 95)"
    line: "oklch(0.82 0.01 95)"
  typography:
    display:
      family: Archivo Narrow
      weight: 700
      source: google
    text:
      family: Arimo
      weight: 400
      source: google
    base: 13px
    scale: 1.2
  radius: 0px
  spacing: 4px
  density: 10
  motion: None. Filters apply instantly and the table re-renders in place.
  depth: Flat. Thin grey table rules and green section bars.
---

## Layout grammar

A left filter rail with every attribute as a checklist, and a main area of spec tables. Each product family has a small line drawing on the left and a table of variants on the right (part number, size, material, price, stock). Section headings are solid green bars with white text.

## Signature moves

1. Spec tables with every attribute as a sortable column and the part number as the link.
2. Line drawings instead of photographs, all in the same stroke weight.
3. Green section bars that act as headings and anchors in a long page.

## Avoid

- Whitespace for its own sake; density is the service.
- Marketing copy above the table.
- Hiding attributes behind "more details".

## In product UI

B2B commerce, procurement, inventory, admin tables, pricing pages with many plans, and any expert tool. A dashboard is a filter rail plus tables. Settings are dense forms grouped under green bars. Best when users search with exact criteria.
