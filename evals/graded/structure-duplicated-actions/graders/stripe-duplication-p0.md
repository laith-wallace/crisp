---
type: llm
---

PASS if the response flags that Stripe customer creation (`new Stripe` plus `customers.create`) is duplicated inline across the three actions (checkout around lines 11-12, upgrade 20-21, trial 29-30), rates it P0 or notes the trial copy has already diverged (missing `name`), AND recommends extracting the Stripe customer creation first.
FAIL if the duplication is missed, the divergence is not noted and severity is below P0, or a different first extraction is recommended.
