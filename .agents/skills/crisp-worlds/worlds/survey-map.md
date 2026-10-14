---
id: survey-map
name: Survey Map
thesis: Layers, a legend and a grid reference; dense information stays readable because every mark has a key.
inspiration: Ordnance Survey topographic maps with contour lines, grid squares and a printed legend
registers: [product, brand]
fights:
  - fintech blue gradient
  - hero metric template
  - identical card grid
tokens:
  colors:
    bg: "oklch(0.97 0.01 100)"
    surface: "oklch(0.94 0.015 110)"
    ink: "oklch(0.24 0.02 60)"
    muted: "oklch(0.44 0.03 60)"
    accent: "oklch(0.5 0.12 55)"
    on-accent: "oklch(0.99 0.005 100)"
    water: "oklch(0.45 0.1 235)"
    line: "oklch(0.8 0.04 60)"
    fill-water: "oklch(0.88 0.05 230)"
    fill-woodland: "oklch(0.88 0.06 140)"
  typography:
    display:
      family: Overpass
      weight: 800
      source: google
    text:
      family: Overpass
      weight: 400
      source: google
    mono:
      family: Overpass Mono
      weight: 400
      source: google
    base: 14px
    scale: 1.25
  radius: 2px
  spacing: 4px
  density: 8
  motion: Spatial only. Pan and zoom ease over 250 ms; layers toggle instantly.
  depth: Layers, not elevation. Fills sit under contours, contours under labels; a printed-style key explains every mark.
---

## Layout grammar

A main field (the map, the canvas, the chart) takes most of the screen, with a legend panel docked to one side that explains every symbol, colour and line style. Faint grid lines with edge coordinates (A to H, 1 to 12) let people refer to any area by reference.

## Signature moves

1. A printed-style legend panel: every colour and symbol in the view has a swatch and a plain-language label.
2. Edge grid references on charts and canvases, so "look at C4" means something.
3. Contour-brown for actions and highlights, water blue for links to other places, and pale fills for areas.

## Avoid

- Colour without a key. If it needs explaining, it goes in the legend.
- Saturated fills; areas are pale so lines and labels stay on top.
- Using it for a sparse page with nothing to map, because the legend becomes decoration.

## In product UI

Analytics, geospatial, logistics, network and dependency views. A dashboard becomes a map-like canvas with a docked legend and grid refs; tables carry the same colour keys. Settings sit in the legend panel as layer toggles with plain labels.
