# DESIGN.md format (Google Labs)

Spec: https://github.com/google-labs-code/design.md. This is a working summary for /crisp-study; when it disagrees with the spec, the spec wins and the lint output is the referee.

## Front matter

YAML between `---` fences at the top of the file.

| Key | Required | Shape |
|---|---|---|
| `name` | yes | string |
| `colors` | yes | map of token name -> CSS colour (`"#1A1C1E"`, `"oklch(62% 0.18 250)"`) |
| `typography` | yes | map of token name -> object |
| `components` | yes | map of component name -> object |
| `version` | no | string, currently `alpha` |
| `description` | no | string |
| `omitted` | no | array of section names left out on purpose |
| `rounded` | no | map of token name -> dimension |
| `spacing` | no | map of token name -> dimension |

Dimensions are a number plus a unit: `"48px"`, `"-0.02em"`.

Typography object keys: `fontFamily`, `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`, `fontFeature`, `fontVariation`.

Component object keys: `backgroundColor`, `textColor`, `typography`, `rounded`, `padding`, `size`, `height`, `width`. Any other key is an `unknown-key` warning.

Token references use braces: `"{colors.primary}"`, `"{typography.body}"`, `"{rounded.md}"`. Every reference must resolve.

## Body sections

`##` headings, in this order. Any may be left out (list it in `omitted:`), but those present must keep the order:

1. Overview
2. Colors
3. Typography
4. Layout
5. Elevation & Depth
6. Shapes
7. Components
8. Do's and Don'ts

/crisp-study appends `## Provenance` after Do's and Don'ts. If lint flags it, keep it and note the info finding; provenance is not optional in this pack.

## Lint rules

| Rule | Severity | Fix |
|---|---|---|
| `broken-ref` | error | Point the reference at an existing token or add the token |
| `missing-primary` | warning | Name the main brand/action colour `primary` |
| `contrast-ratio` | warning | Change the pair, or record it as a Don't with the ratio |
| `orphaned-tokens` | warning | Use the token in a component or delete it |
| `missing-typography` | warning | Add at least a `body` token |
| `section-order` | warning | Reorder headings to the list above |
| `unknown-key` | warning | Use only the keys above |
| `token-like-ignored` | warning | A token-shaped value sits in prose or an unknown key; move it into the YAML |
| `token-summary` | info | Informational counts |
| `missing-sections` | info | Add the section or list it in `omitted:` |
| `omitted-rules` | info | Informational |
