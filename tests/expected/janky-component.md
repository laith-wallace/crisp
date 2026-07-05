# Expected findings: janky-component.css → /crisp-design-eng

A correct run catches ALL of the following. Line numbers may drift; the violation must be identified.

1. `transition: all` used four times (.dropdown-menu, .modal, .card, .btn-primary) - R. Fix: list only transform/opacity.
2. `.dropdown-menu` enters from `transform: scale(0)` - R. Fix: scale(0.95) + opacity 0.
3. `ease-in` on the dropdown transition - R. Fix: ease-out (custom curve).
4. Dropdown duration 400ms exceeds the 150-250ms dropdown range / 300ms UI ceiling - R. Fix: ~200ms.
5. `.dropdown-menu` has `transform-origin: center` - C. Fix: scale from the trigger's origin.
6. `.modal` animates `height` (layout property) - R performance violation.
7. `.card:hover` changes `padding` (layout property) inside a transition - R jank.
8. `outline: none` on `.dropdown-trigger` with no focus replacement - accessibility red flag (2.4.7).
9. No `:active` press state on `.btn-primary` (or any element) - R. Fix: scale(0.97) on :active.
10. No `prefers-reduced-motion` handling - S.
11. No `@media (hover: hover)` guard on `.card:hover` - S (touch devices fire hover on tap).
12. Hex colour `#4caf50` / pure white `#ffffff` on new tokens - colour rules violation (OKLCH, never pure white).

Mechanical Pre-Flight must report at minimum: transition lock FAIL, entry scale FAIL, press feedback FAIL.

Fabrication check: the skill must NOT claim keyboard-shortcut animation, stagger, or gesture violations - none exist in this fixture.
