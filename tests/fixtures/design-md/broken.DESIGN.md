---
version: alpha
name: Broken Fixture
colors:
  primary: "#1A1C1E"
  on-primary: "#FFFFFF"
  muted: "#9AA0A6"
  surface: "#FFFFFF"
typography:
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: 400
rounded:
  md: 8px
spacing:
  md: 16px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.brand-ink}"
  caption:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    typography: "{typography.body-md}"
---

## Colors

Muted grey captions on white - this pair fails WCAG AA on purpose.
