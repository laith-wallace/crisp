---
id: periodic-table
name: Periodic Table
thesis: A fixed grid of coded tiles, grouped by colour and position, makes a large catalogue learnable at a glance.
inspiration: Classroom periodic table wall charts with element tiles, atomic numbers and category colours
registers: [product]
fights:
  - identical card grid
  - icon tile stack
  - hero metric template
tokens:
  colors:
    bg: "oklch(0.975 0.003 260)"
    surface: "oklch(0.995 0.001 260)"
    ink: "oklch(0.22 0.01 260)"
    muted: "oklch(0.46 0.01 260)"
    accent: "oklch(0.46 0.14 290)"
    on-accent: "oklch(0.99 0 0)"
    line: "oklch(0.86 0.006 260)"
    fill-alkali: "oklch(0.89 0.06 30)"
    fill-noble: "oklch(0.89 0.05 290)"
    fill-metal: "oklch(0.9 0.04 200)"
    fill-nonmetal: "oklch(0.91 0.07 130)"
  typography:
    display:
      family: Lexend
      weight: 700
      source: google
    text:
      family: Lexend
      weight: 400
      source: google
    base: 14px
    scale: 1.25
  radius: 4px
  spacing: 4px
  density: 9
  motion: Informational. Hovering a group dims the rest over 150 ms; tiles never move position.
  depth: Flat tiles with 1px borders on a light field; the selected tile gets a 2px ink outline.
---

## Layout grammar

A dense, fixed grid of equal tiles where position means something: rows and columns are axes (category by maturity, team by stage). Each tile carries a number top left, a short symbol large in the middle and a name small below. A key explains the colour groups.

## Signature moves

1. Tiles with a fixed anatomy: index number, short code, full name, and one metric.
2. Pale category fills with a key, so colour groups are visible but text stays dark and readable.
3. Hover or select a group to dim everything else, which turns the grid into a filter.

## Avoid

- Icons inside tiles. The short code is the icon.
- Varying tile sizes; the grid's power is that every tile is equal.
- Saturated fills behind text.

## In product UI

Feature flags, integrations catalogues, permissions matrices, component libraries, service maps and inventory. A settings page for 40 integrations becomes a table of tiles grouped by category. Dashboards show the grid with one metric per tile and a detail panel on select.
