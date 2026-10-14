---
id: pharmacy-label
name: Pharmacy Label
thesis: Every field boxed, labelled and legible at arm's length, because a misread costs more than a plain look.
inspiration: Dispensing labels and patient information leaflets from a high-street pharmacy
registers: [product]
fights:
  - SaaS cloud beige
  - glassmorphism default
  - template copy
tokens:
  colors:
    bg: "oklch(0.975 0.003 200)"
    surface: "oklch(0.995 0 0)"
    ink: "oklch(0.17 0 0)"
    muted: "oklch(0.42 0.003 200)"
    accent: "oklch(0.45 0.09 200)"
    on-accent: "oklch(0.99 0 0)"
    danger: "oklch(0.5 0.19 27)"
    line: "oklch(0.3 0 0)"
    fill-warning: "oklch(0.9 0.16 100)"
  typography:
    display:
      family: Atkinson Hyperlegible
      weight: 700
      source: google
    text:
      family: Atkinson Hyperlegible
      weight: 400
      source: google
    mono:
      family: Red Hat Mono
      weight: 500
      source: google
    base: 17px
    scale: 1.25
  radius: 2px
  spacing: 8px
  density: 7
  motion: Functional only. Validation messages appear instantly; focus rings never animate.
  depth: Boxed fields with 1.5px dark borders on white label stock; no shadows anywhere.
---

## Layout grammar

A label is a stack of boxed fields, each with a small bold caption above its value: Patient, Medicine, Dose, Warnings. Fields share edges like a printed form. The single most important instruction is the largest text on the screen.

## Signature moves

1. Captioned boxes: small bold label on the top border, value inside, every field the same structure.
2. A yellow warning band with black text for cautions, the only fill colour in the system.
3. Reference numbers and quantities in mono, so a pharmacist can read them back without ambiguity.

## Avoid

- Light grey text. Muted text still clears 4.5:1, because the reader may be tired, older or in poor light.
- Icons standing in for words in warnings.
- Hiding required information behind expanders or tooltips.

## In product UI

Forms, checkouts, health, insurance and anything regulated. A settings page becomes a labelled form with fields grouped into boxed sections and the consequence of each change written next to it. Dashboards show one boxed summary per record with the critical value enlarged.
