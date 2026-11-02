#!/usr/bin/env node
/**
 * scripts/render-check.mjs
 *
 * `crisp render-check` - measure a rendered page, not its source. The detector
 * (crisp detect) reads code; this opens the page in a real browser at each
 * width, measures what was drawn, and reports layout faults that only exist
 * at render time: text cut or overlapping, text crammed against its box,
 * labels wrapping, tiny targets, a page wider than the phone.
 *
 * Usage:
 *   crisp render-check <url> [--width 1280,375] [--select <css>] [--json] [--shots <dir>] [--wait <ms>]
 *   crisp render-check --print-script [--select <css>]   browser snippet for an agent's own browser tool
 *   crisp render-check --from <snapshot.json>            analyze a snapshot the snippet returned
 *
 * The browser comes from Playwright in the current project (playwright or
 * playwright-core). It is not a dependency of this package; without it, use
 * --print-script and --from.
 *
 * Exit code: 0 = clean, 2 = findings, 3 = inconclusive (nothing measured), 1 = usage/runtime error.
 */

import { readFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { collectSnapshot } from './render-check/collect.mjs';
import { analyzeAll, RULES } from './render-check/analyze.mjs';

const USAGE = `Usage:
  crisp render-check <url> [--width 1280,375] [--select <css>] [--json] [--shots <dir>] [--wait <ms>]
  crisp render-check --print-script [--select <css>]
  crisp render-check --from <snapshot.json> [--json]`;

function flag(argv, name) {
  const i = argv.indexOf(name);
  return i === -1 ? undefined : argv[i + 1];
}

/** The browser snippet an agent pastes into its own browser tool. Returns the snapshot JSON. */
export function browserScript(select) {
  return `(${collectSnapshot.toString()})(${JSON.stringify({ select: select || null })})`;
}

async function loadPlaywright() {
  const req = createRequire(join(process.cwd(), 'noop.js'));
  for (const name of ['playwright', 'playwright-core']) {
    try {
      const resolved = req.resolve(name);
      const mod = await import(pathToFileURL(resolved).href);
      return mod.chromium ?? mod.default?.chromium;
    } catch { /* try the next one */ }
  }
  return null;
}

async function launch(chromium) {
  try {
    return await chromium.launch();
  } catch (err) {
    const fallbacks = [process.env.CHROME_PATH, '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
    for (const executablePath of fallbacks) {
      if (existsSync(executablePath)) return chromium.launch({ executablePath });
    }
    throw err;
  }
}

function print(report, json) {
  if (json) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }
  for (const run of report.runs) {
    const cov = run.coverage;
    console.log(`width ${run.width}: ${cov.status}${cov.reason ? ` - ${cov.reason}` : ''} (${cov.texts ?? 0} text nodes, ${cov.controls ?? 0} controls measured)`);
  }
  for (const f of report.findings) {
    console.log(`@${f.width}  [${f.severity}] ${f.id} - ${f.message}`);
    console.log(`    ${f.path}`);
  }
  const verdict = report.status === 'clean'
    ? 'clean - 0 findings. Clean measures layout only; it is not a design review.'
    : report.status === 'inconclusive'
      ? 'inconclusive - nothing was measured at one or more widths. Not a pass.'
      : `${report.findingCount} finding(s).`;
  console.log(`\ncrisp render-check: ${verdict}`);
}

const exitFor = report => (report.status === 'inconclusive' ? 3 : report.findingCount ? 2 : 0);

export async function runRenderCheck(argv) {
  const json = argv.includes('--json');
  const select = flag(argv, '--select');

  if (argv.includes('--print-script')) {
    console.log(browserScript(select));
    return 0;
  }

  if (argv.includes('--rules')) {
    for (const [id, r] of Object.entries(RULES)) console.log(`${r.severity}  ${id.padEnd(17)} ${r.title}`);
    return 0;
  }

  const from = flag(argv, '--from');
  if (from) {
    let data;
    try {
      data = JSON.parse(readFileSync(from, 'utf8'));
    } catch (err) {
      console.error(`Could not read ${from}: ${err.message}`);
      return 1;
    }
    const report = analyzeAll(Array.isArray(data) ? data : [data]);
    print(report, json);
    return exitFor(report);
  }

  const valueFlags = new Set(['--width', '--select', '--shots', '--wait', '--from']);
  const url = argv.find((a, i) => !a.startsWith('--') && !valueFlags.has(argv[i - 1]));
  if (!url) {
    console.error(USAGE);
    return 1;
  }
  const widths = (flag(argv, '--width') ?? '1280,375').split(',').map(n => parseInt(n, 10)).filter(n => n > 0);
  const wait = parseInt(flag(argv, '--wait') ?? '300', 10);
  const shots = flag(argv, '--shots');

  const chromium = await loadPlaywright();
  if (!chromium) {
    console.error(`crisp render-check needs Playwright in this project: npm i -D playwright (or playwright-core).
No browser available? Run \`crisp render-check --print-script\`, evaluate the output in your own browser
tool, save the returned JSON, then run \`crisp render-check --from <file>.json\`.`);
    return 1;
  }

  let browser;
  const snaps = [];
  try {
    browser = await launch(chromium);
    if (shots) mkdirSync(shots, { recursive: true });
    for (const w of widths) {
      const page = await browser.newPage({ viewport: { width: w, height: w < 600 ? 812 : 800 } });
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      } catch {
        await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      }
      await page.evaluate(() => document.fonts && document.fonts.ready);
      if (wait > 0) await page.waitForTimeout(wait);
      snaps.push(await page.evaluate(browserScript(select)));
      if (shots) await page.screenshot({ path: join(shots, `render-${w}.png`) });
      await page.close();
    }
  } catch (err) {
    console.error(`crisp render-check: ${err.message}`);
    return 1;
  } finally {
    if (browser) await browser.close();
  }

  const report = analyzeAll(snaps);
  print(report, json);
  return exitFor(report);
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  process.exitCode = await runRenderCheck(process.argv.slice(2));
}
