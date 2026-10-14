---
id: herbarium-sheet
name: Herbarium Sheet
thesis: Each record is a specimen on a sheet, with the object large, the accession label small and every field filled.
inspiration: Natural history herbarium sheets with a pressed specimen, accession stamp and typed collection label
registers: [brand, product]
fights:
  - identical card grid
  - icon tile stack
  - SaaS cloud beige
tokens:
  colors:
    bg: "oklch(0.965 0.012 95)"
    surface: "oklch(0.985 0.008 95)"
    ink: "oklch(0.26 0.02 120)"
    muted: "oklch(0.46 0.02 120)"
    accent: "oklch(0.46 0.09 125)"
    on-accent: "oklch(0.985 0.008 95)"
    stamp: "oklch(0.48 0.12 35)"
    line: "oklch(0.86 0.015 100)"
  typography:
    display:
      family: Gelasio
      weight: 500
      source: google
    text:
      family: Rethink Sans
      weight: 400
      source: google
    base: 15px
    scale: 1.333
  radius: 2px
  spacing: 8px
  density: 5
  motion: Slow and calm. Specimens fade in over 400 ms; filters apply without movement.
  depth: Sheets on a pale field, each with a hairline border and a soft paper shadow. Labels are printed panels on the sheet.
---

## Layout grammar

A collection view is a grid of tall sheets with a consistent ratio; each sheet shows the object large and a small label panel in the lower right. Opening a record shows one sheet at full height with the label expanded into a fielded table: collector, date, location, number.

## Signature moves

1. The accession label: a small bordered panel in the corner with typed fields in a fixed order.
2. A rust-coloured stamp for catalogue numbers and status, like an ink stamp on the sheet.
3. Tall, consistent sheet ratios, so a grid of different objects still reads as one collection.

## Avoid

- Cards with icons and blurbs. A sheet shows the thing itself.
- Mixing sheet ratios in one grid.
- Vintage paper textures and foxing; the structure carries the reference.

## In product UI

Collections, asset libraries, catalogues, CMS media and inventory. A dashboard is the collection grid with a filter rail; a record detail is one sheet with its label table. Settings sit in a single sheet with labelled fields.
