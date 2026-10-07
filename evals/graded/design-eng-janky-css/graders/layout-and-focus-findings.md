---
type: llm
---

PASS if the response identifies ALL four of these, in any wording:
1. `.modal` animates `height`, a layout property (performance problem).
2. `.card:hover` changes `padding`, a layout property, inside a transition (jank).
3. `outline: none` on `.dropdown-trigger` removes the focus indicator with no replacement (accessibility, WCAG 2.4.7 or equivalent).
4. There is no `:active` press state on `.btn-primary` or any element; a fix such as scale(0.97) on :active is suggested.
FAIL if any of the four is missing.
