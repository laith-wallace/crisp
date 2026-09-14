# Expected findings - /crisp-unslop on fixtures/slop-prose.md

Run in **Detect** mode. Every row below must appear, cited by pattern id with the line quoted. Wording of the fix may differ. Zero fabricated findings: the fixture contains no curly quotes, no emoji, no title-case-only headings beyond H1, and no chatbot sign-off - reporting any of those is a regression.

## Pre-check counts (must match)

| Check | Expected |
|---|---|
| Dashes (— or –) | 2 |
| Banned words | 12 distinct: embarked, testament, crucial, leveraged, robust, multifaceted, streamlined, foster, seamless, delve, utilized, facilitate |
| Bold-label-colon lines | 2 |
| Recap openers | 1 |

## Pattern findings (must all be caught)

| Id | Quoted line (or fragment) |
|---|---|
| R1 | "Here's the thing:" |
| L3 | "onboarding isn't just a flow. It's a promise." |
| L1 | "embarked on this journey" |
| C1 | "a testament to how much we had underestimated" |
| C4 | "Experts agree that the first five minutes are crucial" |
| S1 | "crucial — and ours were a mess" and "a team effort — engineering" |
| F1 | "**The problem:** The problem was…" |
| F1 | "**The solution:** The solution leveraged…" |
| C3 | "highlighting a fundamental disconnect" |
| L1 | "robust, multifaceted approach that streamlined" |
| R2 | "What most people get wrong about onboarding" |
| R4 | "Not a checklist. Not a tutorial. A conversation." |
| X3 | "activation improved significantly" (no number given - flag, do not invent one) |
| X1 | "It's worth noting that" |
| X1 | "In order to get here" |
| L1 | "delve into the data", "utilized session replays to facilitate" |
| S2 | "The key insight: users didn't want" |
| E2 | "In conclusion, onboarding is never finished." |
| E1 | "The future of onboarding isn't a flow. It's already here." |

## Must NOT be flagged

- "honestly" in "was, honestly, a testament" - the adverb carries the writer's spoken rhythm (X3 keep-rule). Flagging it alone is acceptable only if the fix says "keep".
- The H1 title - title case in an H1 is the fixture's only heading; S4 applies to body headings.

## Edit-mode additions

If run in Edit mode, additionally check:
- Zero dashes remain (draft is under 300 words).
- "significantly" is not replaced with an invented number; the What changed section flags it for the writer.
- "Experts agree" is cut or flagged, never given a fabricated source.
- The draft ends on the "users didn't want to set up integrations before they'd seen a single dashboard" point or a plain next action - not on a rewritten kicker.
- Output includes the full draft, a What changed section, and a Not fixed section listing the two source-needed items.
