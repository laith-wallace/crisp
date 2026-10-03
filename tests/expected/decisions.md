# Expected behaviour: settled decisions → /crisp-review and /crisp-audit

Run against `fixtures/bad-dashboard.md` with `fixtures/decisions/.crisp.md` as the project's `.crisp.md`.

## Must

1. Drop finding 9 from `expected/bad-dashboard.md` (no keyboard shortcuts). The decision covers `all` surfaces.
2. End the output with `Suppressed by decisions: 1`.
3. Still flag gradient text as a slop tell. The decision covers `marketing/` only, and the dashboard is a Product surface. A run that suppresses it has matched on the issue name and ignored the surface.
4. Every other finding in `expected/bad-dashboard.md` still appears, with the same severity and grade.

## Must not

- Write to `## Decisions`. No one rejected a finding during the run, so there is nothing to log.
- Reopen the keyboard-shortcut decision without new evidence in the fixture.

## Evidence gate

Every reported finding quotes the fixture line it comes from. A finding with no quote appears only under `Unverified`, and only if it would be a P0.
