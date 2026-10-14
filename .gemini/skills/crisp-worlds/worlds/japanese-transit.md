---
id: japanese-transit
name: Japanese Transit
thesis: Colour codes and numbered stops let a stranger find their way without reading a paragraph.
inspiration: Tokyo metro and JR station signage, with line colours, station numbers and bilingual labels
registers: [product, brand]
fights:
  - icon tile stack
  - fake sequence labels
  - identical card grid
tokens:
  colors:
    bg: "oklch(0.985 0.002 240)"
    surface: "oklch(0.95 0.004 240)"
    ink: "oklch(0.22 0.01 250)"
    muted: "oklch(0.46 0.01 250)"
    accent: "oklch(0.5 0.13 150)"
    on-accent: "oklch(0.99 0 0)"
    line: "oklch(0.85 0.005 240)"
    fill-line-orange: "oklch(0.72 0.16 60)"
    fill-line-blue: "oklch(0.6 0.13 240)"
  typography:
    display:
      family: Zen Kaku Gothic New
      weight: 700
      source: google
    text:
      family: Figtree
      weight: 400
      source: google
    base: 15px
    scale: 1.25
  radius: 6px
  spacing: 8px
  density: 7
  motion: Directional. Transitions move along the route (left to right) in 200 ms; nothing bounces.
  depth: Flat signage panels. A coloured band on the leading edge identifies the line; no shadows.
---

## Layout grammar

Horizontal routes. Steps, stages and categories run left to right on a line with nodes, each node carrying a code (G-03) and a short name. Every category has a colour and a letter code, and both appear together so colour is never the only cue.

## Signature moves

1. Line codes: a coloured roundel with a letter and two-digit number (A-01) beside every category or stage, so the code survives in black and white.
2. Stacked labels: primary name large, secondary name or translation small underneath, always in the same order.
3. A route strip across the top of multi-step flows showing where you are, where you came from, and the next stop.

## Avoid

- Colour as the only cue; every coloured element carries a code or label too.
- Numbering things that are not a sequence, because the codes lose their meaning.
- Decorative pictograms; use them only where a standard symbol exists.

## In product UI

Pipelines, onboarding, deploy stages and multi-step forms become routes with stations. Dashboards group work by line colour with codes in tables (B-14 Billing). Settings sections get line codes so support can say "go to S-04". Strong for logistics, travel, workflow and any product with stages.
