---
name: crisp-structure
description: Two-layer code structure - actions own the why and when (business rules, auth, state transitions), a service layer owns the how (reusable operational mechanics with explicit inputs and structured returns). Audits an existing codebase for duplicated mechanics and leaky services with file:line evidence, decides where new-feature code belongs, and writes a one-caller-at-a-time extraction plan. Use for 'where should this go', 'this logic is copy-pasted', 'a fix in one flow didn't reach the others', or before adding a feature that shares mechanics with an existing one.
user-invocable: true
version: "1.0.0"
metadata:
  author: Laith Wallace - FlowConverts
  adapted-from: michaelshimeles/skills code-structure (two-layer model)
---

# /crisp-structure - Actions Decide, Services Do

The same operation written three times in three flows is three places for one bug. This skill keeps product meaning in one layer and operational mechanics in another, so a fix lands once and every caller gets it.

The whole architecture in one sentence: **actions orchestrate domain rules; the service layer centralises reusable mechanics behind a composable, explicit-input API.**

Load `.crisp.md` if it exists. Its stack and jobs-to-be-done name the flows that matter; audit those first.

## The two layers

| Actions (orchestration) | Services (mechanics) |
|---|---|
| Own business rules - what this flow means | Own reusable operations - how to do one thing reliably |
| Own auth and ownership checks | Own provider and SDK calls (email, payments, sandboxes, storage) |
| Own state transitions and status changes | Own command execution, retries at the transport level, health checks |
| Own failure classification and user-facing errors | Return structured results - never throw domain meaning |
| Call service functions | Never call actions, never read or write domain state directly |

Rule of thumb: "what this product flow means" stays in the action; "how to do this operation reliably" moves to a service.

The same split applies to UI code. Route, page, and screen modules are actions: they own data loading order, permissions, navigation, and which state to show. Hooks, clients, and utilities are services: they own fetching, formatting, caching, and parsing. Components render what they are given and own neither. A component that fetches, checks permissions, and formats currency is three layers in one file.

## Modes

Infer the mode from the request, declare it in one line, and proceed. Ask only when two modes fit equally.

| Mode | Trigger | Deliverable |
|---|---|---|
| **Audit** | "review the structure", "why didn't the fix propagate", a codebase or directory with no new feature named | Findings table - every duplicated block and every layer violation, with file:line for each occurrence |
| **Design** | "where should this go", "adding X which is like Y", a feature description | A placement table - each new piece of logic assigned to a layer with the reason, plus which existing service functions it reuses by exact name |
| **Extract** | "pull this out", "dedupe this", an Audit finding the user picked | An ordered migration plan - one block, one caller first, verify, then the rest |

## Step 1 - Gather evidence before judging

Nothing is a finding without a location. Run these before reading for meaning:

```bash
# Candidate duplicated mechanics: the same provider or SDK call from 2+ files
grep -rnE "\b(sendEmail|stripe\.|resend\.|sgMail|s3\.|createSandbox|exec\(|spawn\(|fetch\(['\"]https?://)" --include='*.ts' --include='*.tsx' --include='*.js' --include='*.py' -l . | grep -v node_modules | sort | uniq -c | sort -rn

# Services reaching into domain state (leaky service tells)
grep -rnE "\b(db\.|prisma\.|supabase\.from|knex\(|\.update\(|\.insert\(|status\s*=)" --include='*.ts' --include='*.js' --include='*.py' services/ lib/services/ 2>/dev/null | head -40

# Actions doing raw mechanics inline
grep -rnE "\b(new SDK|new .*Client\(|process\.env\.[A-Z_]+_KEY)" --include='*.ts' --include='*.tsx' --include='*.js' actions/ app/ src/routes/ 2>/dev/null | head -40

# Components that fetch or gate
grep -rnE "\b(useEffect\([^)]*fetch|fetch\(|hasPermission|can[A-Z][a-zA-Z]*\(|role ===)" --include='*.tsx' --include='*.jsx' components/ src/components/ 2>/dev/null | head -40
```

Adjust the paths and identifiers to the repo. The counts are the evidence; a grep with one hit is not duplication.

## Step 2 - Binary rules

Each rule is pass or fail per location. Cite file:line on every fail.

**Extraction**
1. Extract only mechanics that appear in 2 or more callers. One caller = keep it in the action (over-abstraction is a finding too).
2. Extract only non-domain chunks. Auth, policy, status transitions, and error classification never move to a service.
3. One block per extraction. Zero "while I'm here" refactors in the same change.

**Service function shape**
4. Every required input is an explicit parameter. Zero reads of global state, request context, or environment inside the function body beyond configuration that is injected once.
5. Every function returns a structured result (`{ ok, value }` / `{ ok, error, code }` or the repo's equivalent). Zero swallowed errors, zero thrown domain errors.
6. Zero database, ORM, or domain-state writes inside a service function. The service returns; the action decides what to persist.
7. Zero mode flags that make one function do two operations (`process(x, { mode: 'strict' | 'relaxed' })`). Split into two capability functions; the caller composes strictness.
8. Every function in one service module uses the same argument style (single options object or positional - pick one) and the same result shape.

**Action shape**
9. Every action owns its own auth or ownership check. Zero actions that rely on a service to have checked.
10. Every action classifies the service's failure into a user-facing outcome. Zero raw service errors passed to the UI.

**UI**
11. Zero components that fetch, check permissions, or mutate. Components receive data and callbacks.
12. Zero duplicated formatters (currency, dates, relative time) - one exported function per format.

## Step 3 - Anti-patterns and their tells

| Anti-pattern | Tell (grep-able) | Cost |
|---|---|---|
| God service | One module exporting a function over 150 lines, or a function with 6+ parameters and internal branching on a mode flag | Control flow hidden; every caller pays for every branch |
| Leaky service | ORM or `db.` calls inside `services/` | Two places decide state; the action loses control of transitions |
| Inconsistent API | Sibling functions with different arg styles or result shapes in one module | Every caller writes a different adapter |
| Over-abstraction | A service function with exactly one call site | Indirection with no dedupe benefit |
| Inline mechanics | SDK clients constructed inside an action or route handler | Fix in one flow, bug stays in the others |
| Fat component | `fetch`, permission checks, or formatting inside a render component | Untestable render, duplicated across screens |

## Step 4 - Migration checklist (Extract mode)

Order is mandatory. Each step is verified before the next.

1. Write or read the flow in the action first so the intended behaviour is clear.
2. Mark the repeated operational chunk in every caller - list every file:line.
3. Design the capability functions - explicit params, structured returns, one operation each. Name them.
4. Extract into the service module. Do not touch any caller yet.
5. Replace **one** caller. Run typecheck, lint, and that caller's tests or a manual pass.
6. Replace the remaining callers one at a time, verifying after each.
7. Delete the inline copies. Grep to confirm zero remain.
8. Confirm domain policy stayed in the actions - re-run the Step 1 leaky-service grep on the new module.

Any failed verification stops the migration at that caller. Never continue past a red step.

## Example - one mechanic, two rules

```ts
// services/email.ts - mechanics, no policy
export async function sendWelcomeEmail(params: { to: string; name: string }) {
  const html = `<h1>Welcome ${params.name}</h1>`;
  try {
    await emailProvider.send(params.to, "Welcome", html);
    return { ok: true as const };
  } catch (error) {
    return { ok: false as const, code: "EMAIL_SEND_FAILED", error };
  }
}

// actions/userSignup.ts - orchestration owns WHEN
if (user.marketingOptIn) {
  const result = await sendWelcomeEmail({ to: user.email, name: user.name });
  if (!result.ok) log.warn("welcome email skipped", result.code); // signup still succeeds
}

// actions/adminInvite.ts - different rule, same mechanic
const result = await sendWelcomeEmail({ to: invitee.email, name: invitee.name });
if (!result.ok) return { error: "Invite email failed - try again" }; // invite blocks on it
```

Same service. One caller tolerates failure, the other blocks on it. The strictness lives in the action.

## Output - Audit mode

```
## Structure audit: [repo or directory]

**Evidence:** [N] duplicated mechanics, [N] leaky services, [N] fat components, [N] single-caller abstractions

| # | Finding | Rule | Locations | Severity |
|---|---|---|---|---|
| 1 | Stripe customer creation inline in 3 actions | 1 | actions/checkout.ts:41, actions/upgrade.ts:18, actions/trial.ts:66 | P1 |
| 2 | services/billing.ts writes subscription status | 6 | services/billing.ts:88 | P1 |
| 3 | formatMoney duplicated | 12 | components/Cart.tsx:12, components/Invoice.tsx:9 | P2 |
| 4 | services/sandbox.ts prepareRepo has one caller | 1 | services/sandbox.ts:30 | P3 |

Severity: P0 = a bug already diverged between copies; P1 = duplicated or leaky with active callers; P2 = duplication with no divergence yet; P3 = over-abstraction.

**Recommended first extraction:** #1 - highest caller count, smallest block. Say "extract #1" for the plan.
```

## Output - Design mode

```
## Placement: [feature]

| Logic | Layer | Reuses | Why |
|---|---|---|---|
| Check the user owns the project | Action | - | Policy |
| Create the preview sandbox | Service | services/sandbox.ts createManagedSandbox | Already used by deploy.ts:22 and preview.ts:15 |
| Send "preview ready" email | Service | services/email.ts (new: sendPreviewReadyEmail) | Second caller of the email provider |
| Mark project status = previewing | Action | - | State transition |

**New service functions:** 1 (sendPreviewReadyEmail) - justified by 2 callers after this feature.
**Kept in the action on purpose:** retry-on-quota policy - single caller, domain-specific.
```

## Output - Extract mode

The eight-step migration checklist above, filled in with the real file:line list, the real function names, and the exact verification command for step 5.

## Longitudinal tracking

Append one line to `## History` in `.crisp.md` if it exists. Date from `date +%Y-%m-%d`:

```
- [YYYY-MM-DD] | /crisp-structure | [Audit/Design/Extract] | [scope] | [N] findings, [N] P1
```
