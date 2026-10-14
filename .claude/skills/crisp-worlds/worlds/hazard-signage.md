---
id: hazard-signage
name: Hazard Signage
thesis: Signal words, standard colours and bold condensed type; the interface tells you what happens and what to do.
inspiration: Industrial safety signage with DANGER, WARNING and NOTICE headers and black-and-yellow hazard stripes
registers: [product, brand]
fights:
  - SaaS cloud beige
  - glassmorphism default
  - template copy
tokens:
  colors:
    bg: "oklch(0.93 0.005 90)"
    surface: "oklch(0.97 0.003 90)"
    ink: "oklch(0.17 0.005 90)"
    muted: "oklch(0.4 0.005 90)"
    accent: "oklch(0.5 0.16 42)"
    on-accent: "oklch(0.99 0 0)"
    danger: "oklch(0.48 0.19 27)"
    line: "oklch(0.17 0.005 90)"
    fill-hazard: "oklch(0.86 0.17 95)"
  typography:
    display:
      family: Big Shoulders Display
      weight: 800
      source: google
    text:
      family: Archivo
      weight: 400
      source: google
    base: 15px
    scale: 1.333
  radius: 2px
  spacing: 8px
  density: 7
  motion: Abrupt and functional. Alerts appear instantly; a hazard stripe may slide once to draw the eye, never loop.
  depth: Flat sign panels with heavy 2px black borders; hazard stripes as a border pattern on destructive zones.
---

## Layout grammar

Panels with a coloured header band carrying a signal word (NOTICE, WARNING, DANGER), then the instruction in short imperative lines. Pages are stacks of these panels. Destructive areas are fenced with a striped border.

## Signature moves

1. Signal-word header bands in condensed caps: NOTICE for information, WARNING for risk, DANGER for irreversible actions.
2. Black-and-yellow hazard stripes around destructive zones such as "Delete workspace".
3. Imperative instruction lines: what will happen, then what to do.

## Avoid

- Using DANGER for anything recoverable; the scale only works if it is honest.
- Stripes as decoration on normal content.
- Orange or yellow text on light backgrounds; text stays ink, colour stays in bands and borders.

## In product UI

Settings with destructive zones, infrastructure and DevOps consoles, industrial and field-service apps, and admin tools. A settings page ends with a striped Danger Zone panel. Dashboards show incident panels with signal-word headers in severity order.
