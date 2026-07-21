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
