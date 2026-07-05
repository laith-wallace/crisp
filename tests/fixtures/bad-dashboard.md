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
