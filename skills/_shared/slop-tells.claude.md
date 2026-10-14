**Model overlay: Claude.** Seed list, unverified: confirm with scripts/slop-harvest.mjs before trusting. These are tells commonly attributed to Claude-family output, not measured ones. Until a harvest run confirms a row, a match is a note in the report, not a Fail.

| Tell | What it looks like | Nearest detector rule |
|------|--------------------|-----------------------|
| Warm cream + serif display | Beige or cream page, a serif display face with one italic word in the headline, a terracotta or clay accent | `cream-generic-sans` (partial) |
| Em dash cadence | Em dashes joining clauses in headlines, subheads and button-adjacent copy | `em-dash-overuse` |
| Aphoristic hero line | Short paired fragments ("Less noise. More signal.") as the hero headline | `aphoristic-cadence` |
| Tidy three-up | Exactly three feature cards, each with an icon tile, a two-word heading and one sentence | `icon-tile-stack` |
