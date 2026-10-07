---
type: llm
---

PASS if the response flags ALL four of these strings with the stated problem, in any wording:
6. "Done!" - the success message does not say what changed, and/or uses an exclamation mark.
7. "Loading..." - uses three periods instead of the ellipsis character, and/or does not name what is loading.
8. "Publish: publish your campaign" - the tooltip restates the label instead of explaining why or when.
9. "Export" - a menu item that opens a dialog should end with an ellipsis ("Export…").
FAIL if any of the four is not flagged.
