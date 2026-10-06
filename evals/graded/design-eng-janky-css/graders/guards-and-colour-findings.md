---
type: llm
---

PASS if the response identifies ALL three of these, in any wording:
1. No `prefers-reduced-motion` handling.
2. No `@media (hover: hover)` guard around `.card:hover` (touch devices fire hover on tap).
3. The hex colours `#4caf50` and/or pure white `#ffffff` break the colour rules (for example: use OKLCH tokens, avoid pure white).
FAIL if any of the three is missing.
