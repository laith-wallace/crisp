---
type: llm
---

PASS if the response flags ALL of these quoted fragments as AI patterns:
- "What most people get wrong about onboarding"
- "Not a checklist. Not a tutorial. A conversation."
- "activation improved significantly" as vague, WITHOUT inventing a number for it
- "It's worth noting that"
- "In order to get here"
- "delve into the data" and/or "utilized session replays to facilitate"
- "The key insight:"
- "In conclusion, onboarding is never finished."
- "The future of onboarding isn't a flow. It's already here."
FAIL if any is missing, or if the response supplies a made-up activation number.
