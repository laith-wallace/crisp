---
type: llm
---

PASS if the response identifies ALL five of these, in any wording:
1. `transition: all` is used (on .dropdown-menu, .modal, .card and/or .btn-primary) and should list only specific properties such as transform and opacity.
2. `.dropdown-menu` enters from `scale(0)`; it should start near scale(0.95) with opacity 0.
3. The dropdown uses `ease-in`; it should use ease-out (or a custom ease-out curve).
4. The 400ms dropdown duration is too long; it should be around 150-250ms.
5. `transform-origin: center` on the dropdown is wrong; it should scale from the trigger's origin.
FAIL if any of the five is missing.
