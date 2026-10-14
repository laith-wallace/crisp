**Model overlay: Codex and GPT (agents standard).** Seed list, unverified: confirm with scripts/slop-harvest.mjs before trusting. These are tells commonly attributed to GPT-family output, not measured ones. Until a harvest run confirms a row, a match is a note in the report, not a Fail.

| Tell | What it looks like | Nearest detector rule |
|------|--------------------|-----------------------|
| Emoji feature cards | An emoji standing in for an icon at the start of every card or list heading | `emoji-heading-icon` |
| Centred card stack | Centred hero, then centred rows of `rounded-2xl shadow-lg` cards with equal weight | `thin-border-wide-shadow` (partial) |
| Blue-to-purple utility gradient | `from-blue-500 to-purple-600` or similar on the hero or primary button | `purple-blue-gradient` |
| Placeholder content left in | Lorem ipsum, "Your Company", `href="#"` links that go nowhere | `lorem-ipsum`, `dead-href` |
