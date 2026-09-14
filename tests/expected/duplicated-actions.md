# Expected findings - /crisp-structure on fixtures/duplicated-actions.ts

Run in **Audit** mode. Every finding below must appear with the rule number and the line numbers cited (line numbers are exact for `fixtures/duplicated-actions.ts` as shipped). Wording may differ. Severity must match within one level.

## Must be caught

| Finding | Rule | Locations (line numbers in the fixture) | Severity |
|---|---|---|---|
| Stripe customer creation inline in three actions (`new Stripe` + `customers.create`) | 1 / inline mechanics | checkout 11-12, upgrade 20-21, trial 29-30 | P0 - the trial copy has already diverged (no `name`) |
| `syncSubscription` writes `status` to the database from inside a service | 6 / leaky service | 41 | P1 |
| `syncSubscription` takes a `mode: "strict" \| "relaxed"` flag | 7 | 36, 40 | P1 |
| `syncSubscription` throws a domain error instead of returning a structured result | 5 | 40 | P1 |
| `syncSubscription` reads `process.env.STRIPE_KEY` inside the function body | 4 | 38 | P1 |
| Sibling service functions return different shapes (raw value vs `{ ok, path }`) | 8 | 42, 47 | P2 |
| No action checks ownership of `userId` before mutating the user | 9 | 9, 18, 27 | P1 |
| No action classifies Stripe or db failure - raw errors reach the caller | 10 | 12, 21, 30 | P1 |
| `prepareInvoicePdf` has exactly one caller | 1 / over-abstraction | 45-46 | P3 |
| `Cart` fetches inside a render component | 11 / fat component | 53-54 | P1 |
| `formatMoney` duplicated across two components | 12 | 56, 62 | P2 |

## Must NOT be flagged

- The `status: "active"` / `"trial"` writes inside `checkout` and `startTrial` - state transitions belong in actions (rule 2). Flagging them as leaky is a false positive.
- `db.user.find` inside actions - actions may read domain state.
- `Invoice` receiving `total` as a prop - that is the correct component shape.

## Output checks

- The **Evidence** line reports counts that match the table (duplicated mechanics 1-2 depending on whether `formatMoney` is counted there, 1 leaky service, 1 fat component, 1 single-caller abstraction). Rows for rules 5, 7, 4, 8, 9, and 10 may be merged into fewer rows as long as each rule number and location appears.
- The recommended first extraction is the Stripe customer creation (three callers, and a live divergence).
- Zero fixes applied - Audit mode does not edit the fixture.
