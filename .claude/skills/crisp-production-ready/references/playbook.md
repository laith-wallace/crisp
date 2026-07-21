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
