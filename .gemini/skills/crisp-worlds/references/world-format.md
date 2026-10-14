# World format and picker spec - `/crisp-worlds` reference

Load this when writing previews, writing `spec.json`, or adding a world to the library. `tests/unit/worlds.test.mjs` enforces every rule marked **checked**.

## Contents

- World file
- Contrast rules
- Adding a world
- Picker spec
- Preview markup rules

## World file

One file per world: `worlds/<id>.md`. YAML front matter (the same subset DESIGN.md uses), then four `##` sections.

```yaml
---
id: ledger-book                       # lowercase-hyphenated, equals the file name (checked)
name: Ledger Book
thesis: Money is written in ruled columns, right-aligned, with red only for what is owed.
inspiration: Bound accounting ledgers with green-tinted paper and ruled money columns
registers: [product]                  # product, brand, or both (checked)
fights:                               # category defaults this world counters, 1 or more (checked)
  - fintech blue gradient
  - hero metric template
tokens:
  colors:                             # every value is oklch() (checked)
    bg: "oklch(0.965 0.02 140)"       # required
    surface: "oklch(0.98 0.012 140)"  # required
    ink: "oklch(0.24 0.02 250)"       # required
    muted: "oklch(0.44 0.02 200)"     # required
    accent: "oklch(0.42 0.12 255)"    # required; the action colour
    on-accent: "oklch(0.98 0.01 140)" # optional; text on an accent fill
    negative: "oklch(0.5 0.18 25)"    # optional signal colour, used as text
    line: "oklch(0.8 0.05 150)"       # optional; borders and rules
    fill-wash: "oklch(0.9 0.05 150)"  # optional; fill-* are decorative fills, never text
  typography:
    display: { family, weight, source }   # source: google or system (checked)
    text: { family, weight, source }
    mono: { family, weight, source }      # optional
    base: 15px                            # body size (checked)
    scale: 1.25                           # type ratio, 1.1 to 1.7 (checked)
  radius: 2px
  spacing: 4px                        # spacing base unit
  density: 9                          # 1 airy to 10 dense, integer (checked)
  motion: One sentence on when things move and how fast.
  depth: One sentence on elevation, borders and shadows.
---

## Layout grammar        (how a page is put together)
## Signature moves       (exactly 3, numbered; checked)
## Avoid                 (bullets, each with its reason)
## In product UI         (dashboard and settings, not only a landing page)
```

Write the typography objects in block style as the existing files do. The flow style above is shorthand for this page only.

## Contrast rules

All measured with WCAG 2.x contrast after converting OKLCH to sRGB (**checked**, 4.5:1 minimum):

| Pair | Why |
|---|---|
| ink on bg, ink on surface | Body text sits on both |
| muted on bg, muted on surface | Muted text is still text |
| accent on bg | The accent is used for links and labels, not only fills |
| every other non-`fill-` colour on bg | Signal colours (delayed, negative, warning) are read as text |
| on-accent on accent | Button labels |

`line` and `fill-*` are exempt, because they never carry text. A world that needs a bright colour that fails as text keeps it as a `fill-` token.

## Adding a world

1. Name a concrete physical source in `inspiration` (a timetable, a label, a panel), never a style word.
2. Check it is not a near-duplicate: it must differ from every existing world on at least 2 of layout grammar, type pairing, palette hue and density.
3. Avoid the reflex-reject fonts in `/crisp-design-eng` `references/color-typography.md` unless the world's source demands one.
4. Product-register worlds need a body text face that reads well at 13 to 15px.
5. Run `node --test tests/unit/worlds.test.mjs` and `crisp worlds to-design-md <id> --out -` to confirm the DESIGN.md lints clean.

## Picker spec

`.crisp/worlds/spec.json`, validated by `crisp worlds picker`:

```json
{
  "project": "Tally",
  "surface": "the Tally homepage",
  "register": "product",
  "brief": "One or two sentences from .brief.md.",
  "recommended": "C",
  "directions": [
    {
      "id": "A",
      "title": "Category default",
      "worldId": null,
      "isBaseline": true,
      "thesis": "What the category ships by default.",
      "decisions": ["...", "...", "..."],
      "borrowedFrom": [],
      "palette": { "bg": "#f7f5f0", "ink": "#1f2937", "accent": "#6366f1" },
      "html": "<!doctype html>..."
    },
    {
      "id": "C",
      "title": "Timetable of what is due",
      "worldId": "swiss-timetable",
      "isBaseline": false,
      "thesis": "One line: the bet this direction makes.",
      "decisions": ["...", "...", "..."],
      "borrowedFrom": [{ "from": "B", "what": "red reserved for overdue", "why": "one red then means money at risk" }],
      "html": "<!doctype html>..."
    }
  ]
}
```

| Field | Rule |
|---|---|
| `directions` | 2 to 5 entries, ids A to E, unique |
| `worldId` | An id from `crisp worlds list`, or `null` for the baseline only |
| `isBaseline` | At most one `true` |
| `decisions` | Exactly 3 short sentences |
| `borrowedFrom` | Strings, or `{from, what, why}` objects. A non-empty list marks the recommended direction unless `recommended` is set |
| `palette` | Optional, baseline only: swatches to show when there is no world |
| `html` | A complete, self-contained HTML document |

`crisp worlds picker` writes `index.html` and a copy of `spec.json` beside it. `crisp worlds serve` reads that copy to resolve `worldId` for a choice, so the browser cannot record a world the spec did not offer.

## Preview markup rules

- Design for a 1280 by 800 viewport; the card scales it down and Enlarge shows it at full width or 390px. Use fluid widths so the 390px view does not scroll sideways.
- Top half: the hero with the brief's real headline and call to action. Bottom half: one real product surface (table, dashboard panel, settings group) with plausible data.
- Inline `<style>` only. Fonts may load from `fonts.googleapis.com` with one `<link>`. No scripts (the iframe is sandboxed and the picker's content security policy blocks them), no remote images: use CSS, inline SVG or `data:` URIs.
- Use the world's tokens as CSS variables (`crisp worlds show <id> --css`). No colour outside them, except in the baseline.
- Copy follows the brief. No lorem ipsum, because filler hides whether the layout works with real words.
