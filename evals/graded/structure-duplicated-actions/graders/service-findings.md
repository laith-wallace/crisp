---
type: llm
---

PASS if the response flags ALL five of these about `syncSubscription` / the services, citing line numbers near the ones given:
1. It writes `status` to the database from inside a service (leaky service, line 41).
2. It takes a `mode: "strict" | "relaxed"` flag argument (lines 36, 40).
3. It throws a domain error instead of returning a structured result (line 40).
4. It reads `process.env.STRIPE_KEY` inside the function body (line 38).
5. Sibling service functions return different shapes - a raw value vs `{ ok, path }` (lines 42, 47).
Findings may be merged into fewer rows if each point appears.
FAIL if any of the five is missing.
