---
id: journal-preprint
name: Journal Preprint
thesis: An abstract, numbered sections, figures with captions and citations; claims look checkable because they are.
inspiration: Typeset scientific papers and preprints with an abstract, numbered figures and references
registers: [product, brand]
fights:
  - hero metric template
  - template copy
  - emoji feature cards
tokens:
  colors:
    bg: "oklch(0.985 0.002 250)"
    surface: "oklch(0.96 0.003 250)"
    ink: "oklch(0.18 0 0)"
    muted: "oklch(0.42 0.005 250)"
    accent: "oklch(0.45 0.15 25)"
    on-accent: "oklch(0.99 0 0)"
    cite: "oklch(0.44 0.09 160)"
    line: "oklch(0.85 0.003 250)"
  typography:
    display:
      family: STIX Two Text
      weight: 600
      source: google
    text:
      family: STIX Two Text
      weight: 400
      source: google
    mono:
      family: Source Code Pro
      weight: 400
      source: google
    base: 17px
    scale: 1.2
  radius: 0px
  spacing: 8px
  density: 6
  motion: None. Citations and footnotes open inline without animation.
  depth: Flat page. Figures sit in a thin frame with a numbered caption below.
---

## Layout grammar

A title, an author line and a boxed abstract, then numbered sections (1, 1.1, 1.2). Figures and tables are numbered and captioned, and the text refers to them ("see Figure 2"). References are a numbered list at the end; inline citations are bracketed numbers in green.

## Signature moves

1. An abstract box at the top that states the whole claim in under 100 words.
2. Numbered figures and tables with captions that explain what to notice.
3. Bracketed citations that link to sources, so every claim has a footnote.

## Avoid

- Fake equations or jargon to look clever.
- Long unbroken text without figures; a paper shows evidence.
- Italic-serif-plus-mono as a mood; this world is upright and structured.

## In product UI

AI tools, research, analytics and evaluation reports, documentation and model cards. A dashboard reads as a report: abstract (the summary), figures (the charts) with captions, and a methods section. Settings are numbered sections with short explanations.
