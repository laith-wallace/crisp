---
id: lab-instrument
name: Lab Instrument
thesis: The interface is a front panel, with grouped controls, engraved labels and readouts you trust.
inspiration: 1970s laboratory test equipment front panels, putty-grey enclosures with engraved labels
registers: [product]
fights:
  - SaaS cloud beige
  - identical card grid
  - glassmorphism default
tokens:
  colors:
    bg: "oklch(0.87 0.012 85)"
    surface: "oklch(0.92 0.01 85)"
    ink: "oklch(0.24 0.02 50)"
    muted: "oklch(0.4 0.02 60)"
    accent: "oklch(0.47 0.15 42)"
    on-accent: "oklch(0.98 0.005 85)"
    ok: "oklch(0.42 0.1 150)"
    line: "oklch(0.7 0.015 80)"
    fill-readout: "oklch(0.3 0.02 60)"
  typography:
    display:
      family: Chivo
      weight: 800
      source: google
    text:
      family: Chivo
      weight: 400
      source: google
    mono:
      family: Chivo Mono
      weight: 500
      source: google
    base: 14px
    scale: 1.2
  radius: 4px
  spacing: 4px
  density: 9
  motion: Mechanical and short. Toggles snap in 80 ms with no overshoot; readouts update without animation.
  depth: Recessed readout wells (1px inset shadow, darker fill) and raised keys (1px bottom edge). Two levels only.
---

## Layout grammar

Controls are grouped into labelled panels with a small-caps label engraved above each group, the way an oscilloscope groups Vertical, Horizontal and Trigger. Groups align on a 4px grid and fill the width. The readout sits top left in a dark well; controls sit below or to the right of it.

## Signature moves

1. Small-caps group labels with wide tracking, in muted ink, above every cluster of controls.
2. One dark readout well per screen showing the key value in mono, like a display window cut into the panel.
3. Orange marks the one control that changes state (run, apply, arm); everything else is putty and ink.

## Avoid

- Skeuomorphic knobs and brushed metal. Borrow the grouping and labelling, not the hardware.
- Cards with icons. Panels have labels, not pictures.
- Loose spacing, because a calm panel needs density to read as an instrument.

## In product UI

Settings become a front panel: groups such as Connection, Limits and Alerts each in an engraved block, with toggles and inputs on a grid and the live value in a readout. Dashboards put one readout well top left and grouped controls around it. Suits developer tools, observability, IoT, audio and scientific software.
