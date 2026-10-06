---
type: llm
---

PASS if the response flags ALL five of these:
1. No action checks that the caller owns `userId` before mutating the user (lines 9, 18, 27).
2. No action classifies Stripe or database failures - raw errors reach the caller (lines 12, 21, 30).
3. `prepareInvoicePdf` has exactly one caller (over-abstraction, P3-ish, lines 45-46).
4. `Cart` fetches data inside a render component (fat component, lines 53-54).
5. `formatMoney` is duplicated across the two components (lines 56, 62).
FAIL if any of the five is missing.
