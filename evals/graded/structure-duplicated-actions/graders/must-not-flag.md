---
type: llm
---

PASS if the response does NOT flag any of these as problems:
- the `status: "active"` / `"trial"` writes inside `checkout` and `startTrial` (state transitions belong in actions)
- `db.user.find` calls inside actions (actions may read domain state)
- `Invoice` receiving `total` as a prop
FAIL if any of these is reported as a violation.
