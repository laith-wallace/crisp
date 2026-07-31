---
name: crisp-production-ready
description: Production-readiness audit ending in a visual HTML remediation playbook - repeated passes through 24 lenses until two consecutive passes surface nothing new, every finding verified against the real code, delivered as a findings list plus production-playbook.html. Use for 'production ready', 'can we ship', 'pre-launch audit', or any launch-readiness check.
user-invocable: true
version: "1.0.0"
metadata:
  author: Laith Wallace - FlowConverts
---

# /crisp-production-ready - Production Audit + Playbook

Run a complete production-readiness audit of this codebase/product. Do not stop for confirmation. Do not summarize the audit away - the flat list IS the report.

This is a defensive engagement: the codebase under audit is one the user owns or is authorized to test and modify. Find defects, prove them against the real code, and, when asked to fix, remediate them. Do not produce working exploits, attack live systems, or probe anything outside this codebase.

If `.crisp.md` exists in the project root, load it first - product context, users, and benchmarks sharpen the claim-vs-code and content lenses.

## Two deliverables, always both

1. **The flat findings list** - printed in chat, one row per finding, ordered by severity. Format defined below. No preamble, no closing summary.
2. **`production-playbook.html`** - a single self-contained HTML file written to the project root: a visual, step-by-step remediation playbook with a verdict, a scoreboard, and checkable fix cards grouped into three waves. Load `references/playbook.md` before generating it and follow its spec exactly.

The list is for the agent and the record. The playbook is for the human: someone who did not run the audit must be able to open it and know exactly what to do, in what order, and how to prove each fix worked.

## Principles

- Trust what the code does, not what it's called. Open the file. Trace the real path: UI → API → data layer → response → render.
- A public claim without implementing code is itself a HIGH finding (README, landing page, docs, security page: every specific promise gets verified).
- One pass is never enough. Audit in repeated passes, each from a DIFFERENT angle, until two consecutive passes surface zero new findings.
- Verify every finding before reporting it: check it against the real code (guard upstream? enforced elsewhere? actually unreachable? does the test pass?). Verify, don't argue it away. If you can't pin it to file:line or URL+selector, drop it; if you can pin it but can't confirm it's safe, keep it and note the uncertainty (a located, uncleared security risk is reported, not dropped).
- A short list means you didn't look hard enough. Real products carry hundreds of findings.

## Process

1. **Inventory.** Silently build a complete feature inventory first. The full checklist is in `references/lenses.md` - every route, element, state, auth surface, API, job, file flow, comm, billing flow, public surface, asset, prompt, and public claim, across every locale, theme, viewport, and platform shipped. Audit every item, however small.
2. **Gates.** Run the project's own gates before anything else: clean install, full build, typecheck across every package, lint, complete test suite. Every failure or ignored warning is a finding, and so is a gate configured so it cannot fail (ignoreBuildErrors, `|| true`, skipped tests, suppressions). Record each gate's status - the playbook shows them.
3. **Discovery loop.** Each pass sweeps the whole inventory through ONE lens from `references/lenses.md`. Never repeat a lens; append only NEW findings (de-duplicate by file+issue) and keep a pass ledger (`pass #, lens, new findings`).
4. **Converge.** Stop discovery only when two consecutive diverse passes find nothing new. Cap the loop: run every applicable lens at least once plus a ceiling of a few more passes; if you hit the cap first, report what you have and say so. Convergence is a strong heuristic for "looked hard enough", not a proof nothing remains. Before reporting, read `.audit-ignore` at the repo root if present and skip findings matching a confirmed-false-positive entry there (format `path:line  issue-tag  # reason`); never add entries yourself.
5. **Fan out if you can.** If your harness supports subagents or parallel tasks, fan out one finder per lens/subsystem and route every candidate finding through a verifier in a fresh context (a different model if available), prompted to confirm or clear it against the code, not to argue it away. If not, run lenses sequentially yourself with the same verification step.
6. **Report.** Print the flat list, then generate `production-playbook.html` per `references/playbook.md`, then end with one line telling the user to open the playbook.

## Scoping

The user may scope the run (one subsystem like src/billing, one lens family like security, or docs-vs-code). Apply the same loop, lenses, and rules to the narrowed inventory. No scope given = the whole product. A scoped run still produces both deliverables; the playbook header names the scope.

## Output 1: the flat list

A single flat list. No preamble, no overview, no closing summary. Each row, 1-2 lines max:

```
[SEVERITY] [AREA] path/to/file.ts:123 - what is wrong - one-line fix
```

For example:

```
[CRITICAL] [SECURITY] src/lib/cache.ts:21 - dashboard cache key omits the workspace id; one tenant's data served to another - add the tenant to the key
[HIGH] [CONTENT] landing/security.html §hero - claims "AES-256 encryption at rest"; no encryption configured in the storage layer - implement it or remove the claim
[MEDIUM] [PERF] src/dashboard/page.tsx:61 - members fetched per project in a loop (N+1) - one grouped query
```

SEVERITY = CRITICAL (data loss, breach, broken core flow, crash) / HIGH (claimed feature broken or missing, security weakness, silent failure) / MEDIUM (degraded behavior, edge-case failure, real inconsistency) / LOW (minor bug, polish) / IMPROVEMENT (concrete upgrade only, no hedging).

AREA = whatever fits the product: FRONTEND BACKEND API DB SECURITY AUTH DOCS CONTENT UX A11Y PERF RELIABILITY DATA BUILD MOBILE INTEGRATION CONFIG AI.

Order CRITICAL → HIGH → MEDIUM → LOW → IMPROVEMENT; group by AREA within severity.

### Hard rules

- Every row has file:line or URL+selector. No location means drop the row.
- No "consider/might/could/potentially". Concrete defects, concrete fixes.
- Don't skip small features or known-broken areas; same depth everywhere, no commentary.
- If you run out of context, end with exactly one line: `TRUNCATED AT [area] - [N] inventory items unchecked. Nothing after it.` Then still generate the playbook from the findings gathered so far, marked TRUNCATED in its header.

## The verdict (binary, no judgement call)

- **NOT READY** - one or more CRITICAL findings.
- **FIX FIRST** - zero CRITICAL, one or more HIGH.
- **READY** - zero CRITICAL and zero HIGH.

MEDIUM and below never block the verdict. The verdict leads the playbook and is the one sentence you say in chat after the list.

## Output 2: the playbook

Load `references/playbook.md` and generate `production-playbook.html` exactly to its spec. In short: verdict banner, severity scoreboard, gate status, three remediation waves (Wave 1 = CRITICAL+HIGH, Wave 2 = MEDIUM, Wave 3 = LOW+IMPROVEMENT), one checkable card per finding with what's wrong / what to do / how to prove it's fixed, progress persisted in localStorage, zero external requests, print-friendly. Re-runs overwrite the file; checked state survives because card ids are stable slugs.

## If asked to fix

Fix in severity waves (1: CRITICAL+HIGH, 2: MEDIUM, 3: LOW+IMPROVEMENT), gating each wave on green clean build + typecheck + lint + full test suite, then reviewing every change for over-reach (anything changed beyond its finding gets reverted). Deferrals are listed with a reason, never silently dropped. Then run a verification loop: re-audit with fresh angles (regression, fix-completeness, over-reach; the same mistake is almost never made once) and fix what surfaces, round after round, until two consecutive passes find zero CRITICAL and zero HIGH. Expect 10+ rounds on a real codebase; cap at a sane ceiling and report any still-open CRITICAL/HIGH rather than looping forever. After each wave, regenerate `production-playbook.html` so the playbook reflects reality.
