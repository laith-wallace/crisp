# Expected findings: bad-dashboard.md → /crisp-review and /crisp-audit

## Slop check (both skills)

Must FAIL, naming at minimum four tells: hero metric template, gradient text, side-stripe
borders, identical card grid, glassmorphism default, generic sans + off-white (Inter).
One or more tells = Fail is binary - a "Pass with notes" is a regression.

## Violations a correct run must catch

1. [I] "1,247" hero number with no comparison, trend, or action - insight failure. P1.
2. [P] Eleven metrics at equal visual weight - no hierarchy, no progressive disclosure. P1.
3. [R] Spinner on every filter change (~800ms) - needs optimistic/local filtering. P1.
4. [R] Tab switch triggers full reload with blank content - needs skeleton/kept state. P1.
5. [C] "No data available" empty state - no orientation, no CTA. P1.
6. [P] Delete Workspace with no confirmation and no undo - destructive without recovery. P0.
7. [C] Generic "Success" toast - doesn't say what changed. P2.
8. [S] Custom date picker breaking familiar patterns, opens on hover, no keyboard support. P1 (also an a11y P0 if /crisp-a11y is run).
9. [P] No keyboard shortcuts for power users. P2/P3.

## Grade discipline

- /crisp-review: one P0 present → grade D (per the binary grade rules). An A/B grade is a scoring regression.
- /crisp-audit: scores must follow the mechanical rule (10 - 3/P0 - 2/P1 - 1/P2, floor 1), the P dimension must reflect the P0 cap (grade ≤ C), and the emotional-journey check must flag the unprotected destructive action as the anxiety peak.

Fabrication check: the skill must NOT flag contrast failures, load performance numbers, or mobile issues - the fixture gives no evidence of them.
