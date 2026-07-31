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


---

<!-- references/lenses.md -->

# Inventory, lenses, and per-feature checks

Load this before starting the discovery loop. The inventory is the coverage checklist; the lenses are the pass angles. Never repeat a lens within one audit.

## The inventory

Silently build a complete feature inventory first:

- Every page/route/screen (including admin pages and settings toggles)
- Every interactive UI element and state (forms + validation, modals, toasts, dropdowns, search/filter/sort, bulk actions, keyboard shortcuts, undo, pagination; loading/empty/error/offline/404/500)
- Auth surfaces (signup, login, password reset, OAuth/SSO, MFA, sessions, invitations, roles, account deletion)
- Every CLI command, API endpoint, webhook, integration, background job
- File flows (upload/download, import/export, previews)
- Outbound comms (emails, push, SMS, in-app notifications)
- Billing flows (checkout, trials, upgrades, payment failure, cancellation)
- Public surfaces (share links, embeds, sitemap/robots, OG/meta, deep links)
- Realtime channels
- Static assets (icons, images, animations, fonts, favicons)
- LLM prompts and model configs
- Every claim in the README/docs/landing/legal/security pages

Across every locale, theme, viewport, and platform shipped. This is your coverage checklist: audit every item, however small.

## The lenses

Each discovery pass sweeps the whole inventory through exactly ONE of these:

- **Subsystem sweep**: one subsystem at a time (auth, billing, search, ...), entry points traced to storage and back. Best first pass.
- **Attack-class**: IDOR, cross-tenant isolation, client-only auth, SQL/XSS/command/prompt injection, exposed secrets, unverified webhooks, share-link enforcement after revocation.
- **Auth & permissions deep-dive**: full role x action matrix enforced server-side; session expiry, rotation, server-side logout invalidation; token signature/expiry validation and revocation; single-use expiring reset tokens; no user enumeration; MFA recovery bypasses; demotion strips access immediately; permission caches never serve stale grants; safe default permissions on new resources.
- **Claim-vs-code**: every specific public promise (numbers, guarantees, feature names) traced to the code that delivers it; staged demo data presented as real counts too.
- **Data-shape**: zero/one/partial/huge data, unicode/emoji/RTL, very long strings, 100k rows; pagination without limits; UI assuming at least one element.
- **Platform divergence & responsiveness**: web vs mobile vs CLI vs API parity; dark mode; every page at phone/tablet/desktop widths (overflow, fixed widths, broken breakpoints, touch targets).
- **Lifecycle**: signup → onboarding → daily use → plan change → offboarding → deletion; retention promises actually honored, revoked integrations actually stop, deletion cascades.
- **Write-path integrity**: external-effect writes idempotent under retry; non-atomic sibling writes (record live before its permission row).
- **Failure-mode**: each dependency down/slow/garbage: timeouts, backoff, swallowed errors, dead-letter paths, malformed-response parsing.
- **Dead-and-stale**: docs for removed features, TODO/FIXME in prod paths, flags off with live marketing, old screenshots, drifted migrations.
- **Gate-escape**: defects that pass the gates run in step 2 (type errors outside the typecheck path, generated code outside CI, assertion-free tests).
- **Perf**: N+1, missing indexes, no-LIMIT queries, unbounded loops, render waterfalls, bundle size; Core Web Vitals, unoptimized images, render-blocking assets, missing cache headers; calls without timeout or cap.
- **A11y & UX-jank**: focus order, ARIA, contrast, reduce-motion, skeleton/empty/error states, forms losing input, destructive actions without confirm or undo; animations that stutter, never finish, or block input; spinners with no failure path.
- **Content & copy**: typos, placeholder text, jargon on non-technical pages, stack traces/JSON/NaN rendered to users; every number, stat, and price identical across landing/pricing/docs/app.
- **Asset & icon integrity**: broken images/icons, mixed icon sets, icons contradicting their action, missing favicon/OG/touch icons, missing alt text, fonts that flash or never load.
- **Connection & wiring**: frontend calls to dead/renamed endpoints, hardcoded localhost/staging URLs, secrets in the client bundle, CORS wider than needed; DB pool size vs concurrency, leaked connections, no acquire timeout, missing TLS; test keys in prod, env mismatches between duplicated configs.
- **LLM & prompt quality**: prompts contradicting their output parsers, unvalidated model output with no fallback, missing token/cost/timeout caps, deprecated model IDs, near-duplicate prompts drifted apart, PII to providers, user content concatenated where instructions live.
- **Resource leaks & long-running drift**: listeners/intervals/observers never cleaned up, unbounded in-memory caches, unclosed file/socket/DB handles, workers growing with uptime, temp files accumulating, logs without rotation.
- **Observability & ops**: errors swallowed untracked, unlogged critical paths, PII in logs, no health checks, no graceful shutdown, no alerts on job failures, stack traces or source maps in prod.
- **Abuse & limits**: no rate limits on auth/email/expensive endpoints, unbounded uploads and payloads, uncapped LLM spend, missing storage quotas, no bot resistance where it matters.
- **Config & environment**: env vars unvalidated at boot, dev defaults in prod, debug mode reachable, drifted duplicate configs, untested flag states, real secrets in committed examples.
- **Dependency & supply-chain**: known CVEs in the lockfile, deprecated packages, unpinned versions, duplicate versions of one library, install scripts, license conflicts.
- **Caching correctness**: cache keys missing tenant/user scope, stale after writes, authorization cached past revocation, CDN caching authenticated responses, localStorage surviving logout.
- **Concurrency & races**: double-submit, two tabs, two workers on one job, webhooks delivered twice, check-then-act without unique constraints, last-write-wins edits, non-atomic counters, job locks that don't expire.

## Per-feature checks

For every inventory item, regardless of lens:

- Implemented end-to-end or stubbed
- Empty/partial/huge data handled
- Loading/error/empty states exist
- Server-side authorization on every path that reaches the data, correct for every role (not just the happy path)
- External writes idempotent and audited
- Parity across every surface the product ships

## The pass ledger

Keep a running ledger the whole audit; it goes into the playbook verbatim:

```
| Pass | Lens | New findings |
|---|---|---|
| 1 | Subsystem sweep: auth | 14 |
| 2 | Attack-class | 9 |
| ... | ... | ... |
```

Two consecutive rows with 0 new findings = converged.


---

<!-- references/playbook.md -->

# Playbook output spec - production-playbook.html

The playbook is the human-facing deliverable. Its reader did not run the audit and may not be the person who will do the fixing. Opening the file must answer three questions in the first screen: can we ship, how bad is it, and what do I do first.

Write it to the project root as `production-playbook.html`. Re-runs overwrite it. Card ids are stable slugs (see below) so checked-off progress survives regeneration.

## Binary rules (count them, no judgement calls)

1. One file, zero external requests. Count of `src`/`href` attributes loading a remote resource = 0. No CDN fonts, no CDN scripts, no analytics.
2. System font stack for text, monospace stack for code/locations. No webfonts.
3. Exactly six functional colors on dark neutrals: one per severity (CRITICAL red, HIGH orange, MEDIUM amber, LOW blue, IMPROVEMENT violet) plus one green reserved for done/READY states. No other hues.
4. Em dash count in the file = 0. Use " - ".
5. No gradient text, no glassmorphism, no side-stripe card borders. Severity is shown by a chip, never by a colored card edge.
6. Every finding card has a checkbox. Checked state persists to localStorage under key `crisp-prod:<slug>`.
7. Each wave shows "N of M fixed" and a progress bar; both update live on check.
8. Readable with JavaScript disabled: all content is static HTML, JS only adds persistence and progress.
9. Print stylesheet: light background, chips keep their color, checkboxes print as squares, nav hidden.
10. Every claim in the playbook copies from the audit verbatim: same severity, same location, same fix. The playbook adds a "Prove it" line per finding; it never softens or reworks a finding.

## Structure, in order

1. **Verdict banner.** Product name, scope (or "Full product"), audit date, commit hash. One giant verdict: NOT READY / FIX FIRST / READY, with the binary rule spelled out under it ("2 CRITICAL findings block launch"). If the audit truncated, a TRUNCATED strip sits directly under the banner naming what went unchecked.
2. **Scoreboard.** One count tile per severity (colored number, label, "0" tiles render dimmed). Beside it, horizontal bars of findings per AREA. Below, the gates table (install / build / typecheck / lint / tests, each PASS or FAIL with a one-line note) and the pass ledger in a collapsed `<details>`.
3. **How to use this playbook.** Three sentences, verbatim: "Work top to bottom. Finish and verify every card in a wave before starting the next, and re-run your build, typecheck, lint, and tests after each wave. Check off a card only after its Prove-it step passes."
4. **The three waves.** Each wave is a numbered section with a title, a one-line mission, its progress bar, and its finding cards:
   - **Wave 1 - Make it safe to ship.** All CRITICAL, then all HIGH. Mission line: "Nothing else matters until this section is empty."
   - **Wave 2 - Make it solid.** All MEDIUM. Mission line: "Degraded behavior and edge cases. Ship-blocking only if you promised them."
   - **Wave 3 - Make it polished.** All LOW and IMPROVEMENT. Mission line: "Do these in slack time. Do not let them jump the queue."
   Within a wave, order by severity then group by AREA with a small area label between groups. An empty wave still renders, with a single line: "Nothing found in this wave."
5. **Re-audit footer.** One line: "After Wave 1 is clear, run /crisp-production-ready again. A fix is not done until a fresh audit stops finding it."

## Card anatomy

Each finding is one card:

- Checkbox (top-left, 20px, generous hit area via the whole header being the `<label>`)
- Severity chip + AREA chip
- Location in monospace: `src/lib/cache.ts:21`
- **What's wrong:** the finding, in plain language a non-author understands. Expand the audit row's shorthand; never assume the reader knows the codebase.
- **Do this:** the fix, expanded to 1-3 concrete sentences (which file, which change, what to watch out for).
- **Prove it:** one concrete verification step (the command to run, the request to make, the screen to load and what it must show). Write this fresh for the playbook; the flat list does not carry it.

A checked card dims to 55% opacity and its title gets a strikethrough. It never moves or collapses; the reader keeps their place.

## Slug rule

`slug = severity + "-" + area + "-" + location`, lowercased, every non-alphanumeric run collapsed to one hyphen. Example: `critical-security-src-lib-cache-ts-21`. Deterministic from the finding, so re-audits keep old checkmarks for unchanged findings and new findings arrive unchecked.

## Skeleton

Use this skeleton verbatim for tokens, layout, and behavior; replace the sample content with real audit data and repeat the card/wave markup as needed.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Production Readiness Playbook</title>
<style>
  :root{
    --bg:#0e1116; --surface:#161b22; --surface-2:#1d232c; --border:#2a313c;
    --text:#e6e9ef; --muted:#8b95a5;
    --critical:#f0564f; --high:#f28b3b; --medium:#e3b341; --low:#539bf5;
    --improvement:#a78bfa; --ok:#4ac26b;
    --mono:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
  }
  *{box-sizing:border-box;margin:0}
  body{background:var(--bg);color:var(--text);
    font:16px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    padding:48px 24px 96px}
  main{max-width:880px;margin:0 auto}
  h1{font-size:15px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
  .meta{color:var(--muted);font-size:14px;margin-top:4px}
  .verdict{margin:28px 0 8px;font-size:56px;font-weight:800;letter-spacing:-.02em}
  .verdict.not-ready{color:var(--critical)} .verdict.fix-first{color:var(--high)} .verdict.ready{color:var(--ok)}
  .verdict-rule{color:var(--muted);font-size:15px}
  section{margin-top:56px}
  h2{font-size:22px;font-weight:700;margin-bottom:6px}
  .mission{color:var(--muted);font-size:15px;margin-bottom:18px}
  .tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-top:20px}
  .tile{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px}
  .tile b{display:block;font-size:32px;font-weight:800}
  .tile span{font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
  .tile.zero b{color:var(--muted);opacity:.5}
  .areas{margin-top:20px;display:grid;gap:8px}
  .area-row{display:grid;grid-template-columns:130px 1fr 36px;gap:10px;align-items:center;font-size:13px}
  .area-row .bar{height:8px;border-radius:4px;background:var(--surface-2);overflow:hidden}
  .area-row .bar i{display:block;height:100%;background:var(--low)}
  table{width:100%;border-collapse:collapse;margin-top:20px;font-size:14px}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--border)}
  th{color:var(--muted);font-weight:600;font-size:12px;letter-spacing:.06em;text-transform:uppercase}
  .pass{color:var(--ok);font-weight:700} .fail{color:var(--critical);font-weight:700}
  details{margin-top:16px;color:var(--muted)} summary{cursor:pointer;font-size:14px}
  .progress{display:flex;align-items:center;gap:12px;margin-bottom:20px;font-size:13px;color:var(--muted)}
  .progress .track{flex:1;height:6px;border-radius:3px;background:var(--surface-2);overflow:hidden}
  .progress .fill{display:block;height:100%;width:0;background:var(--ok);transition:width .25s ease}
  .area-label{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);margin:22px 0 10px}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px 20px;margin-bottom:12px}
  .card.done{opacity:.55} .card.done .what b{text-decoration:line-through}
  .card-head{display:flex;align-items:center;gap:10px;cursor:pointer}
  .card-head input{width:20px;height:20px;accent-color:var(--ok);flex:none}
  .chip{font-size:11px;font-weight:700;letter-spacing:.05em;padding:3px 9px;border-radius:999px;color:var(--bg)}
  .chip.critical{background:var(--critical)} .chip.high{background:var(--high)}
  .chip.medium{background:var(--medium)} .chip.low{background:var(--low)}
  .chip.improvement{background:var(--improvement)}
  .chip.area{background:var(--surface-2);color:var(--muted);border:1px solid var(--border)}
  .loc{font-family:var(--mono);font-size:13px;color:var(--muted);margin-left:auto}
  .card p{margin-top:12px;font-size:15px}
  .card p b{display:block;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-bottom:2px}
  .card .prove{font-family:var(--mono);font-size:13.5px;background:var(--surface-2);border-radius:8px;padding:10px 12px;margin-top:6px}
  footer{margin-top:64px;color:var(--muted);font-size:14px;border-top:1px solid var(--border);padding-top:20px}
  @media print{
    body{background:#fff;color:#111;padding:0}
    .tile,.card,.prove{background:#fff;border-color:#ccc}
    .verdict.ready{color:#137333}.verdict.not-ready{color:#c5221f}.verdict.fix-first{color:#b45309}
    .loc,.meta,.mission{color:#555}
  }
</style>
</head>
<body>
<main>
  <header>
    <h1>Production Readiness Playbook</h1>
    <p class="meta">Acme App · Full product · Audited 2026-07-14 · commit a1b2c3d</p>
    <p class="verdict not-ready">NOT READY</p>
    <p class="verdict-rule">2 CRITICAL findings block launch. READY requires zero CRITICAL and zero HIGH.</p>
  </header>

  <section>
    <h2>Scoreboard</h2>
    <div class="tiles">
      <div class="tile"><b style="color:var(--critical)">2</b><span>Critical</span></div>
      <div class="tile"><b style="color:var(--high)">7</b><span>High</span></div>
      <div class="tile"><b style="color:var(--medium)">15</b><span>Medium</span></div>
      <div class="tile"><b style="color:var(--low)">21</b><span>Low</span></div>
      <div class="tile zero"><b>0</b><span>Improvement</span></div>
    </div>
    <div class="areas">
      <div class="area-row"><span>SECURITY</span><span class="bar"><i style="width:60%"></i></span><span>12</span></div>
      <!-- one row per AREA, bar width = count / max count -->
    </div>
    <table>
      <tr><th>Gate</th><th>Status</th><th>Note</th></tr>
      <tr><td>Install</td><td class="pass">PASS</td><td>clean install, no warnings</td></tr>
      <tr><td>Tests</td><td class="fail">FAIL</td><td>3 failures in billing.test.ts</td></tr>
    </table>
    <details><summary>Pass ledger</summary>
      <table><tr><th>Pass</th><th>Lens</th><th>New findings</th></tr>
      <tr><td>1</td><td>Subsystem sweep: auth</td><td>14</td></tr></table>
    </details>
  </section>

  <section>
    <h2>How to use this playbook</h2>
    <p class="mission">Work top to bottom. Finish and verify every card in a wave before starting
    the next, and re-run your build, typecheck, lint, and tests after each wave. Check off a card
    only after its Prove-it step passes.</p>
  </section>

  <section data-wave>
    <h2>Wave 1 - Make it safe to ship</h2>
    <p class="mission">All CRITICAL and HIGH findings. Nothing else matters until this section is empty.</p>
    <div class="progress"><span class="count">0 of 9 fixed</span><span class="track"><span class="fill"></span></span></div>

    <p class="area-label">Security</p>
    <div class="card" data-slug="critical-security-src-lib-cache-ts-21">
      <label class="card-head">
        <input type="checkbox">
        <span class="chip critical">CRITICAL</span><span class="chip area">SECURITY</span>
        <span class="loc">src/lib/cache.ts:21</span>
      </label>
      <p class="what"><b>What's wrong</b>The dashboard cache key is built from the route alone and
      omits the workspace id, so the first tenant to load a dashboard caches it for everyone: the
      next tenant is served another company's data.</p>
      <p><b>Do this</b>Add the authenticated workspace id to the cache key in
      <code>getCachedDashboard</code>, and flush the existing cache on deploy so no poisoned
      entries survive.</p>
      <p><b>Prove it</b></p>
      <p class="prove">Log in as tenant A, load /dashboard, then log in as tenant B in a fresh
      session and load /dashboard. B must never see A's numbers.</p>
    </div>
    <!-- more cards -->
  </section>

  <section data-wave>
    <h2>Wave 2 - Make it solid</h2>
    <p class="mission">All MEDIUM findings. Degraded behavior and edge cases. Ship-blocking only if you promised them.</p>
    <div class="progress"><span class="count">0 of 15 fixed</span><span class="track"><span class="fill"></span></span></div>
    <!-- cards -->
  </section>

  <section data-wave>
    <h2>Wave 3 - Make it polished</h2>
    <p class="mission">All LOW and IMPROVEMENT findings. Do these in slack time. Do not let them jump the queue.</p>
    <div class="progress"><span class="count">0 of 21 fixed</span><span class="track"><span class="fill"></span></span></div>
    <!-- cards -->
  </section>

  <footer>After Wave 1 is clear, run /crisp-production-ready again. A fix is not done until a
  fresh audit stops finding it.</footer>
</main>
<script>
  document.querySelectorAll('.card').forEach(card => {
    const box = card.querySelector('input');
    const key = 'crisp-prod:' + card.dataset.slug;
    box.checked = localStorage.getItem(key) === '1';
    card.classList.toggle('done', box.checked);
    box.addEventListener('change', () => {
      localStorage.setItem(key, box.checked ? '1' : '0');
      card.classList.toggle('done', box.checked);
      update(card.closest('[data-wave]'));
    });
  });
  function update(wave){
    const boxes = wave.querySelectorAll('.card input');
    const done = wave.querySelectorAll('.card input:checked').length;
    wave.querySelector('.count').textContent = done + ' of ' + boxes.length + ' fixed';
    wave.querySelector('.fill').style.width = boxes.length ? (100 * done / boxes.length) + '%' : '0%';
  }
  document.querySelectorAll('[data-wave]').forEach(update);
</script>
</body>
</html>
```
