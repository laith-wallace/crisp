---
id: man-page
name: Man Page
thesis: Documentation-grade structure, with fixed section names in caps and examples you can copy, makes a tool feel trustworthy.
inspiration: Unix manual pages and printed 1980s programmer's reference manuals
registers: [product]
fights:
  - hero metric template
  - icon tile stack
  - glow halo
tokens:
  colors:
    bg: "oklch(0.975 0.004 100)"
    surface: "oklch(0.94 0.006 100)"
    ink: "oklch(0.2 0.005 100)"
    muted: "oklch(0.45 0.008 100)"
    accent: "oklch(0.45 0.1 165)"
    on-accent: "oklch(0.99 0.002 100)"
    line: "oklch(0.85 0.005 100)"
  typography:
    display:
      family: Martian Mono
      weight: 700
      source: google
    text:
      family: JetBrains Mono
      weight: 400
      source: google
    base: 14px
    scale: 1.2
  radius: 0px
  spacing: 8px
  density: 8
  motion: None. Content swaps instantly; the cursor is the only thing that blinks, and only in a real input.
  depth: Flat. Indentation and capitalised section headings carry all the structure.
---

## Layout grammar

A fixed reading column of about 80 characters. Section headings in caps sit flush left (NAME, SYNOPSIS, OPTIONS, EXAMPLES, SEE ALSO) and their content is indented one step. Options are a two-column definition list: flag on the left, explanation on the right.

## Signature moves

1. Caps section names in a fixed order, so every page of the product has the same skeleton.
2. Definition lists for options and settings, with the flag or key in bold and the explanation beside it.
3. Copyable example blocks on a slightly darker surface, with a quiet "copy" text button.

## Avoid

- Marketing headlines. The first line says what the thing does in one sentence.
- Mixing in a proportional display face, because the mono grid is the whole look.
- Long lines past about 80 characters.

## In product UI

Developer tools, CLIs, APIs and internal admin. Settings become an OPTIONS list: key, current value, explanation, default. Dashboards are plain status pages with indented sections. Pairs well with keyboard-first navigation.
