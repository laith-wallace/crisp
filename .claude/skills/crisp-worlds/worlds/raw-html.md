---
id: raw-html
name: Raw HTML
thesis: Browser defaults on purpose, with blue underlined links, black rules and system fonts; honesty as a style.
inspiration: Early web pages and university homepages built with default HTML and no stylesheet
registers: [product, brand]
fights:
  - SaaS cloud beige
  - glassmorphism default
  - decorative motion
tokens:
  colors:
    bg: "oklch(0.995 0 0)"
    surface: "oklch(0.95 0 0)"
    ink: "oklch(0.15 0 0)"
    muted: "oklch(0.42 0 0)"
    accent: "oklch(0.45 0.27 264)"
    on-accent: "oklch(0.995 0 0)"
    visited: "oklch(0.4 0.2 320)"
    line: "oklch(0.15 0 0)"
  typography:
    display:
      family: Times New Roman, Times, serif
      weight: 700
      source: system
    text:
      family: Arial, Helvetica, sans-serif
      weight: 400
      source: system
    mono:
      family: ui-monospace, Menlo, Consolas, monospace
      weight: 400
      source: system
    base: 16px
    scale: 1.333
  radius: 0px
  spacing: 8px
  density: 6
  motion: None. The page loads and stays put.
  depth: None. 1px black borders, horizontal rules and default form controls.
---

## Layout grammar

A single flowing document with headings, paragraphs, lists, tables with 1px borders and horizontal rules between sections. Max width around 72 characters. Navigation is a line of underlined links at the top. Forms use native controls with visible labels.

## Signature moves

1. Underlined blue links and purple visited links, exactly as the browser intended.
2. Bordered tables and `<hr>` rules as the only structure.
3. Native form controls, unstyled, which are also the most accessible version of each control.

## Avoid

- Half-committing. One rounded card or gradient and it reads as unfinished, not deliberate.
- Pure white glare at night; offer a dark scheme that keeps the same plainness.
- Using it for a brand that needs warmth or trust signals from polish.

## In product UI

Internal tools, admin panels, documentation, developer products and contrarian brands. Settings are a plain form with fieldsets and legends. Dashboards are bordered tables with links. Fast, accessible and cheap to build.
