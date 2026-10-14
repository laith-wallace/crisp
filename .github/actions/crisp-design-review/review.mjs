#!/usr/bin/env node
/**
 * .github/actions/crisp-design-review/review.mjs
 *
 * The deterministic half of the CRISP design review action. No dependencies:
 * Node built-ins plus the `gh` CLI that GitHub-hosted runners ship with.
 *
 * Subcommands:
 *   changed  <out-file>                 list the PR's changed UI files (added, modified, renamed) into out-file
 *   detect   <list-file> <out-json>     run the CRISP detector on those files, write its --json output
 *   comment  <detect-json> [list-file]  post or update the ONE sticky findings comment
 *   upsert   <marker> <body-file>       post or update a sticky comment with any body (used by the optional AI job)
 *
 * Environment (set by action.yml): GH_TOKEN, GITHUB_REPOSITORY, PR_NUMBER,
 * HEAD_SHA, CRISP_COMMAND (optional override), ACTION_PATH, MAX_ROWS,
 * FAIL_ON (none|P0|P1|P2|P3), GITHUB_OUTPUT, GITHUB_STEP_SUMMARY.
 */

import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'node:fs';
import { execFileSync, spawnSync } from 'node:child_process';
import { join, extname } from 'node:path';

export const UI_EXTENSIONS = ['.html', '.htm', '.css', '.scss', '.jsx', '.tsx', '.vue', '.svelte', '.astro'];
export const MARKER = '<!-- crisp-design-review -->';
const SEVERITY_ORDER = { P0: 0, P1: 1, P2: 2, P3: 3 };

const env = name => process.env[name] || '';

function gh(args, input) {
  return execFileSync('gh', args, { encoding: 'utf8', input, maxBuffer: 64 * 1024 * 1024, stdio: ['pipe', 'pipe', 'pipe'] });
}

export function isUiFile(path) {
  return UI_EXTENSIONS.includes(extname(path).toLowerCase());
}

/** Pick the detector command: explicit override, this repo, a local install, then the copy bundled with the action. */
export function crispCommand({ override, cwd = process.cwd(), actionPath } = {}) {
  if (override) return override.split(' ').filter(Boolean);
  try {
    const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
    if (pkg.name === '@laith-wallace/crisp' && existsSync(join(cwd, 'bin', 'crisp.mjs'))) return ['node', 'bin/crisp.mjs'];
  } catch { /* no package.json */ }
  if (existsSync(join(cwd, 'node_modules', '.bin', 'crisp'))) return ['npx', '--no-install', 'crisp'];
  if (actionPath && existsSync(join(actionPath, '..', '..', '..', 'bin', 'crisp.mjs'))) {
    return ['node', join(actionPath, '..', '..', '..', 'bin', 'crisp.mjs')];
  }
  return ['npx', '--no-install', 'crisp'];
}

// The detector's messages run to several sentences; the first one names the problem.
const firstSentence = (msg = '') => {
  const s = String(msg).split(/(?<=\.)\s/)[0];
  return s.length > 100 ? `${s.slice(0, 97)}...` : s;
};

const esc = s => String(s).replace(/\|/g, '\\|').replace(/[\r\n]+/g, ' ');

/** Build the sticky comment body from the detector's --json output. */
export function buildComment(result, { files = [], repo = '', sha = '', maxRows = 50 } = {}) {
  const findings = [...(result.findings || [])].sort((a, b) =>
    (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9) || a.file.localeCompare(b.file) || a.line - b.line);
  const counts = {};
  for (const f of findings) counts[f.severity] = (counts[f.severity] || 0) + 1;
  const scanned = result.filesScanned ?? files.length;

  const lines = [MARKER, '### CRISP design review', ''];
  if (findings.length === 0) {
    lines.push(`No detector findings in ${scanned} changed UI file(s).`);
  } else {
    const summary = ['P0', 'P1', 'P2', 'P3'].filter(s => counts[s]).map(s => `${counts[s]} ${s}`).join(', ');
    lines.push(`${findings.length} finding(s) in ${scanned} changed UI file(s): ${summary}.`, '');
    lines.push('| Rule | Location | Severity | Note |', '|---|---|---|---|');
    for (const f of findings.slice(0, maxRows)) {
      const loc = `${f.file}:${f.line}`;
      const link = repo && sha ? `[${esc(loc)}](https://github.com/${repo}/blob/${sha}/${encodeURI(f.file)}#L${f.line})` : `\`${esc(loc)}\``;
      lines.push(`| \`${esc(f.id)}\` | ${link} | ${esc(f.severity)} | ${esc(firstSentence(f.message))} |`);
    }
    if (findings.length > maxRows) lines.push('', `Showing the first ${maxRows}. Run \`npx crisp detect <files>\` locally for the full list.`);
    lines.push('', 'To accept one on purpose: `crisp-disable-line <rule-id>: reason` on that line, or `crisp ignores add-value <rule-id> "<value>" --reason "..."`.');
  }
  lines.push('', '<sub>Deterministic scan by the CRISP detector. No model call, no data leaves the runner.</sub>');
  return lines.join('\n');
}

function changed(outFile) {
  const repo = env('GITHUB_REPOSITORY');
  const pr = env('PR_NUMBER');
  const raw = gh(['api', '--paginate', `repos/${repo}/pulls/${pr}/files`, '--jq', '.[] | select(.status != "removed") | .filename']);
  const files = raw.split('\n').map(s => s.trim()).filter(Boolean).filter(isUiFile).filter(f => existsSync(f));
  writeFileSync(outFile, files.join('\n') + (files.length ? '\n' : ''));
  if (env('GITHUB_OUTPUT')) appendFileSync(env('GITHUB_OUTPUT'), `count=${files.length}\n`);
  console.log(`crisp-design-review: ${files.length} changed UI file(s)`);
  return 0;
}

function detect(listFile, outJson) {
  const files = readFileSync(listFile, 'utf8').split('\n').filter(Boolean);
  if (files.length === 0) {
    writeFileSync(outJson, JSON.stringify({ filesScanned: 0, findingCount: 0, findings: [] }));
    return 0;
  }
  const [cmd, ...base] = crispCommand({ override: env('CRISP_COMMAND'), actionPath: env('ACTION_PATH') });
  const res = spawnSync(cmd, [...base, 'detect', '--json', ...files], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (res.status !== 0 && res.status !== 2) {
    console.error(`crisp detect failed (exit ${res.status}): ${res.stderr || res.error?.message || ''}`);
    return 1;
  }
  writeFileSync(outJson, res.stdout);
  const json = JSON.parse(res.stdout);
  if (env('GITHUB_OUTPUT')) appendFileSync(env('GITHUB_OUTPUT'), `findings=${json.findingCount}\n`);
  return 0;
}

/** Find our comment by marker; update it, or create one. Returns the comment URL. */
function upsertComment(marker, body) {
  const repo = env('GITHUB_REPOSITORY');
  const pr = env('PR_NUMBER');
  const ids = gh(['api', '--paginate', `repos/${repo}/issues/${pr}/comments`, '--jq', `.[] | select(.body | startswith(${JSON.stringify(marker)})) | .id`])
    .split('\n').filter(Boolean);
  const payload = JSON.stringify({ body });
  const out = ids.length
    ? gh(['api', '-X', 'PATCH', `repos/${repo}/issues/comments/${ids[0]}`, '--input', '-', '--jq', '.html_url'], payload)
    : gh(['api', '-X', 'POST', `repos/${repo}/issues/${pr}/comments`, '--input', '-', '--jq', '.html_url'], payload);
  return out.trim();
}

function hasComment(marker) {
  const repo = env('GITHUB_REPOSITORY');
  const pr = env('PR_NUMBER');
  return gh(['api', '--paginate', `repos/${repo}/issues/${pr}/comments`, '--jq', `.[] | select(.body | startswith(${JSON.stringify(marker)})) | .id`]).trim() !== '';
}

function postOrSummarise(marker, body, { skipIfNew = false } = {}) {
  if (env('GITHUB_STEP_SUMMARY')) appendFileSync(env('GITHUB_STEP_SUMMARY'), body.replace(marker, '') + '\n');
  try {
    if (skipIfNew && !hasComment(marker)) {
      console.log('crisp-design-review: nothing to report and no earlier comment, so no comment posted.');
      return 0;
    }
    console.log(`crisp-design-review: ${upsertComment(marker, body)}`);
  } catch (err) {
    // Fork PRs get a read-only token. The job summary above still carries the table.
    console.log(`::warning::crisp-design-review could not comment (${String(err.stderr || err.message).trim().split('\n')[0]}). Findings are in the job summary.`);
  }
  return 0;
}

function comment(detectJson, listFile) {
  const result = JSON.parse(readFileSync(detectJson, 'utf8'));
  const files = listFile && existsSync(listFile) ? readFileSync(listFile, 'utf8').split('\n').filter(Boolean) : [];
  const body = buildComment(result, {
    files,
    repo: env('GITHUB_REPOSITORY'),
    sha: env('HEAD_SHA'),
    maxRows: Number(env('MAX_ROWS')) || 50,
  });
  postOrSummarise(MARKER, body, { skipIfNew: files.length === 0 });

  const failOn = env('FAIL_ON') || 'none';
  if (failOn !== 'none' && failOn in SEVERITY_ORDER) {
    const blocking = (result.findings || []).filter(f => (SEVERITY_ORDER[f.severity] ?? 9) <= SEVERITY_ORDER[failOn]);
    if (blocking.length) {
      console.log(`::error::${blocking.length} finding(s) at ${failOn} or worse.`);
      return 1;
    }
  }
  return 0;
}

function upsert(marker, bodyFile) {
  const tag = `<!-- ${marker} -->`;
  const body = `${tag}\n${readFileSync(bodyFile, 'utf8').trim()}`;
  return postOrSummarise(tag, body);
}

function main([sub, ...args]) {
  if (sub === 'changed' && args[0]) return changed(args[0]);
  if (sub === 'detect' && args[1]) return detect(args[0], args[1]);
  if (sub === 'comment' && args[0]) return comment(args[0], args[1]);
  if (sub === 'upsert' && args[1]) return upsert(args[0], args[1]);
  console.error('Usage: review.mjs changed <out> | detect <list> <out.json> | comment <detect.json> [list] | upsert <marker> <body-file>');
  return 1;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) process.exitCode = main(process.argv.slice(2));
