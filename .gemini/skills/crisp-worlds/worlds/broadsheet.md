---
id: broadsheet
name: Broadsheet
thesis: Hierarchy by headline size and column rules, so the most important story is unmistakable.
inspiration: Broadsheet newspaper front pages with a masthead, column rules and one lead story
registers: [brand, product]
fights:
  - centred three-card stack
  - hero pill badge
  - SaaS cloud beige
tokens:
  colors:
    bg: "oklch(0.955 0.008 85)"
    surface: "oklch(0.975 0.005 85)"
    ink: "oklch(0.17 0.005 60)"
    muted: "oklch(0.43 0.01 60)"
    accent: "oklch(0.42 0.14 5)"
    on-accent: "oklch(0.98 0.005 85)"
    line: "oklch(0.3 0.005 60)"
  typography:
    display:
      family: Libre Caslon Display
      weight: 400
      source: google
    text:
      family: Source Serif 4
      weight: 400
      source: google
    base: 17px
    scale: 1.414
  radius: 0px
  spacing: 8px
  density: 7
  motion: None for content. A 150 ms fade when a section loads; headlines never animate.
  depth: Flat newsprint. Vertical column rules and a double rule under the masthead do all the separating.
---

## Layout grammar

A masthead band, then an asymmetric column grid: one lead story spanning three or four columns, secondary stories in narrow columns beside it. Vertical hairline rules divide the columns. Headline size states priority, with at least three clearly different sizes on the page.

## Signature moves

1. One very large roman headline for the lead, set tight, with a deck (sub-headline) in the text face below it.
2. Vertical column rules and a double rule under the masthead, instead of cards or boxes.
3. Small-caps section kickers in claret above headlines, the only colour on the page.

## Avoid

- Italic display serif with mono labels as a default look. This world is roman, ruled and text-led.
- Equal-sized stories, because a front page without a lead is just a list.
- A photo in every slot. Text earns most of the space.

## In product UI

A dashboard becomes a front page: the one metric or incident that matters most is the lead, with secondary panels in narrower columns. Changelogs, reports and inboxes read naturally as columns. Settings stay a single readable column with section kickers. Fits publishing, research, analytics summaries and internal reporting.
