#!/usr/bin/env bash
# Seeds the workspace for decisions-suppression. Copies of tests/fixtures/bad-dashboard.md and tests/fixtures/decisions/.crisp.md.
set -euo pipefail
cat > bad-dashboard.md <<'CRISP_FIXTURE_EOF'
# Fixture: analytics dashboard description

Review this design. Seeded with known violations - do not "fix" this file.

The dashboard greets the user with a hero section: a large gradient-text "1,247" with a
small grey label beneath it and three supporting stats below, all on cards with a purple
left-border stripe. Below that, eleven metric cards in an identical grid - same size,
same icon-heading-text layout, equal visual weight, glassmorphism (blur + transparency)
surfaces on an off-white background set in Inter.

Interactions: changing any filter shows a centred spinner for ~800ms while the page
refetches. Switching tabs triggers a full data reload with a blank content area. There
are no keyboard shortcuts.

When a workspace has no data yet, the content area shows "No data available."

The Delete Workspace button removes the workspace immediately - no confirmation, no undo.
After saving dashboard settings, a toast says "Success".

The date-range picker is a custom-built component that opens on hover and cannot be
operated with a keyboard.
CRISP_FIXTURE_EOF
cat > .crisp.md <<'CRISP_FIXTURE_EOF'
# .crisp.md - CRISP Design Context
<!-- crisp-teach: v1.10.0 -->

## Product
Analytics dashboard for revenue teams.
Type: B2B SaaS
Register: Product

## Benchmarks
Priority CRISP dimension: I

## History

## Decisions
- 2026-09-20 | No keyboard shortcuts for power users | all | accepted | Shortcuts ship in Q1 with the command palette; tracked separately
- 2026-09-20 | Gradient text | marketing/ | accepted | Brand register campaign pages only
CRISP_FIXTURE_EOF
