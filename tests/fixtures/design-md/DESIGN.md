---
version: alpha
name: Fixture Ledger
description: A calm, ink-on-paper system for a finance dashboard.
colors:
  primary: "#1A1C1E"
  on-primary: "#FFFFFF"
  secondary: "#6C7278"
  tertiary: "#B8422E"
  on-tertiary: "#FFFFFF"
  neutral: "#F7F5F2"
  surface: "#FFFFFF"
  on-surface: "#1A1C1E"
  accent: "{colors.tertiary}"
typography:
  headline-lg:
    fontFamily: Public Sans
    fontSize: 32px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.02em
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  label-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
rounded:
  sm: 4px
  md: 8px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.sm}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.md}"
  chip:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.secondary}"
    typography: "{typography.headline-lg}"
---

# Fixture Ledger

## Overview

Quiet, precise and trustworthy. Ink on warm paper, one red accent for action.

## Colors

- **Primary (#1A1C1E):** deep ink for headlines and primary actions.
- **Tertiary (#B8422E):** the single accent, reserved for the most important action.

## Typography

Public Sans for reading, Space Grotesk for labels and data.

## Layout

An 8px scale with a 4px half-step.

## Shapes

Small, consistent radii: 4px for inline controls, 8px for cards and buttons.

## Components

Primary buttons are ink on white text; cards sit on pure white.

## Do's and Don'ts

- Do keep the accent for one action per screen
- Don't mix sharp and rounded corners in one view
