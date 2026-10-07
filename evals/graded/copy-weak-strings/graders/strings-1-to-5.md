---
type: llm
---

PASS if the response flags ALL five of these strings with the stated problem, in any wording:
1. "No data available" - empty state names nothing missing, gives no reason, and has no recovery action or CTA.
2. "An error occurred!" - names no failure, offers no recovery action, and/or uses an exclamation mark.
3. "Submit" - the CTA names the mechanism, not the outcome (for example "Send request").
4. "Delete" - the destructive label does not name what is being deleted (for example "Delete supplier").
5. "Are you sure?" - the confirmation names neither the item nor the consequence or irreversibility.
FAIL if any of the five is not flagged.
