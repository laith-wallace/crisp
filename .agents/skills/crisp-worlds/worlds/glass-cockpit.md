---
id: glass-cockpit
name: Glass Cockpit
thesis: Colour is a contract; each hue means one state, so an operator reads the screen at a glance at night.
inspiration: Airliner glass cockpit displays, where cyan, green, amber and red each carry one meaning
registers: [product]
fights:
  - glassmorphism dark dashboard
  - glow halo
  - decorative motion
tokens:
  colors:
    bg: "oklch(0.18 0.005 250)"
    surface: "oklch(0.23 0.006 250)"
    ink: "oklch(0.94 0.005 250)"
    muted: "oklch(0.72 0.01 250)"
    accent: "oklch(0.82 0.12 200)"
    on-accent: "oklch(0.18 0.005 250)"
    engaged: "oklch(0.8 0.17 145)"
    caution: "oklch(0.83 0.15 80)"
    warning: "oklch(0.7 0.19 28)"
    line: "oklch(0.33 0.008 250)"
  typography:
    display:
      family: B612
      weight: 700
      source: google
    text:
      family: B612
      weight: 400
      source: google
    mono:
      family: B612 Mono
      weight: 400
      source: google
    base: 14px
    scale: 1.2
  radius: 2px
  spacing: 4px
  density: 9
  motion: Only for state. A new warning appears with a 2 Hz flash for three cycles, then holds steady; nothing else animates.
  depth: Flat, on a near-black field. Thin grey boxes frame instruments; no glow, no blur.
---

## Layout grammar

Fixed instrument zones that never move: primary status top left, secondary right, messages along the bottom. Each zone has a framed box and a short caps label. The layout is the same every time so the eye knows where to look.

## Signature moves

1. A published colour contract: cyan means selectable or set by you, green means engaged, amber means caution, red means act now. No exceptions.
2. A message list at the bottom ordered by severity, red first, each with the action to take.
3. Mono numerals with fixed width, so changing values never shift the layout.

## Avoid

- Glow, blur and gradients; they reduce legibility in the dark.
- Using any status colour as decoration or branding.
- Moving panels or responsive reshuffles on large screens; position is part of the meaning.

## In product UI

Operations centres, monitoring, trading, security and medical devices; anything used for hours, often in low light. Dashboards are instrument zones with a severity-ordered message list. Settings use cyan for editable values and grey for fixed ones.
