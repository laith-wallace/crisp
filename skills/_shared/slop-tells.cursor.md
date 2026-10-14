**Model overlay: Cursor.** Seed list, unverified: confirm with scripts/slop-harvest.mjs before trusting. Cursor runs several model families, so these are tells commonly attributed to its default component stack, not to one model. Until a harvest run confirms a row, a match is a note in the report, not a Fail.

| Tell | What it looks like | Nearest detector rule |
|------|--------------------|-----------------------|
| Untouched component-kit defaults | Zinc or slate neutrals, default radius, every surface wrapped in a bordered card | `nested-card-selector` (partial) |
| Card inside card | A `Card` component holding further bordered or shadowed panels | `nested-card-selector` |
| Icon-only buttons with no label | Icon buttons from the kit with no `aria-label` or visible text | `icon-button-no-label` |
| Blanket transitions | `transition-all` or `transition: all` on most interactive elements | `transition-all` |
