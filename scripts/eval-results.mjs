/**
 * scripts/eval-results.mjs
 *
 * Defensive reader for `claude plugin eval` result folders
 * (evals/results/<timestamp>/, see evals/README.md). Shared by
 * scripts/slop-harvest.mjs and scripts/gallery.mjs.
 *
 * The result format is not a stable contract we control, so this reader
 * assumes as little as possible:
 *
 *   1. Every *.json file is parsed whole; every *.jsonl file line by line.
 *      Unparseable files are skipped, not fatal.
 *   2. The JSON tree is walked with an inherited context. Any object may set
 *      the model (keys: model, model_id, modelId, agent_model, agentModel),
 *      the arm (arm, ablation, variant, condition, mode, plugin_mode) or the
 *      case (case, case_name, caseName, case_id, caseId). Children inherit
 *      what their ancestors set, so a top-level `model` applies to every run.
 *   3. An arm value naming a baseline (baseline, without, no-plugin, none,
 *      off, control, ablated) is the baseline arm. One naming the plugin
 *      (with, plugin, treatment, on, enabled) is the plugin arm. Anything
 *      else is "unknown". Booleans on keys like plugin_enabled / with_plugin
 *      are read the obvious way.
 *   4. Subtrees under grader, judge, rubric, expected or prompt keys are
 *      skipped: those hold our own text, not the model's output.
 *   5. Code is pulled out of every remaining string three ways: fenced
 *      blocks tagged html, css, scss, jsx, tsx, vue, svelte or astro; a
 *      string sitting next to a file_path / path key with a UI extension
 *      (Write and Edit tool inputs); or a bare string that is plainly an
 *      HTML document. Identical code is counted once per model and arm.
 *   6. Files on disk with a UI extension are read as outputs too; their arm
 *      and model come from path segments (for example .../baseline/... or
 *      .../without/...) when the JSON around them does not say.
 *
 * If a future format breaks one of these, fix it here; both consumers follow.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';

export const UI_EXTENSIONS = ['.html', '.htm', '.css', '.scss', '.jsx', '.tsx', '.vue', '.svelte', '.astro'];
const FENCE_LANGS = { html: '.html', htm: '.html', css: '.css', scss: '.scss', jsx: '.jsx', tsx: '.tsx', vue: '.vue', svelte: '.svelte', astro: '.astro' };

const MODEL_KEYS = ['model', 'model_id', 'modelId', 'agent_model', 'agentModel'];
const ARM_KEYS = ['arm', 'ablation', 'variant', 'condition', 'mode', 'plugin_mode', 'pluginMode'];
const ARM_BOOL_KEYS = ['plugin_enabled', 'pluginEnabled', 'with_plugin', 'withPlugin'];
const CASE_KEYS = ['case', 'case_name', 'caseName', 'case_id', 'caseId'];
const PROMPT_KEYS = ['prompt', 'prompt_text', 'promptText', 'input'];
const SKIP_KEYS = /^(graders?|judges?|judge_.*|rubrics?|expected.*|prompts?|system_prompt|append_system_prompt)$/i;

const BASELINE_RE = /^(baseline|without([-_ ]?plugin)?|no[-_ ]?plugin|none|off|control|ablated|ablation)$/i;
const PLUGIN_RE = /^(with([-_ ]?plugin)?|plugin|treatment|on|enabled)$/i;

export function classifyArm(value) {
  if (typeof value === 'boolean') return value ? 'plugin' : 'baseline';
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (BASELINE_RE.test(v)) return 'baseline';
  if (PLUGIN_RE.test(v)) return 'plugin';
  return null;
}

/** Pull UI code out of one string. Returns [{ ext, code }]. */
export function extractCode(str, siblingPath) {
  if (typeof str !== 'string' || str.length < 20) return [];
  const out = [];
  const fence = /```([a-zA-Z]+)[^\n]*\n([\s\S]*?)```/g;
  let m;
  while ((m = fence.exec(str)) !== null) {
    const ext = FENCE_LANGS[m[1].toLowerCase()];
    if (ext && m[2].trim()) out.push({ ext, code: m[2] });
  }
  if (out.length) return out;
  if (siblingPath && UI_EXTENSIONS.includes(extname(siblingPath).toLowerCase())) {
    return [{ ext: extname(siblingPath).toLowerCase(), code: str }];
  }
  if (/<!doctype html|<html[\s>]/i.test(str) && /<\/(body|html|div|main|section)>/i.test(str)) {
    return [{ ext: '.html', code: str }];
  }
  return [];
}

function listFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (st.isDirectory()) out.push(...listFiles(full));
    else out.push(full);
  }
  return out;
}

function contextFromPath(root, file) {
  const ctx = {};
  for (const seg of relative(root, file).split(sep)) {
    const name = seg.replace(/\.[a-z]+$/i, '');
    ctx.arm ??= classifyArm(name) ?? undefined;
  }
  return ctx;
}

function pick(node, keys) {
  for (const k of keys) {
    if (typeof node[k] === 'string' && node[k].trim()) return node[k].trim();
  }
  return undefined;
}

function walkJson(node, ctx, emit, prompts) {
  if (Array.isArray(node)) {
    for (const item of node) walkJson(item, ctx, emit, prompts);
    return;
  }
  if (!node || typeof node !== 'object') return;

  const next = { ...ctx };
  const model = pick(node, MODEL_KEYS);
  if (model) next.model = model;
  for (const k of ARM_KEYS) {
    const arm = classifyArm(node[k]);
    if (arm) { next.arm = arm; break; }
  }
  for (const k of ARM_BOOL_KEYS) {
    if (typeof node[k] === 'boolean') next.arm = node[k] ? 'plugin' : 'baseline';
  }
  const caseName = pick(node, CASE_KEYS);
  if (caseName) next.case = caseName;
  const prompt = pick(node, PROMPT_KEYS);
  if (prompt && next.case && !prompts.has(next.case)) prompts.set(next.case, prompt);

  const siblingPath = typeof node.file_path === 'string' ? node.file_path
    : typeof node.filePath === 'string' ? node.filePath
    : typeof node.path === 'string' ? node.path : undefined;

  for (const [key, value] of Object.entries(node)) {
    if (SKIP_KEYS.test(key)) continue;
    if (typeof value === 'string') {
      if (MODEL_KEYS.includes(key) || ARM_KEYS.includes(key) || CASE_KEYS.includes(key)) continue;
      for (const piece of extractCode(value, siblingPath)) emit({ ...next, ...piece, source: key });
    } else if (value && typeof value === 'object') {
      walkJson(value, next, emit, prompts);
    }
  }
}

/**
 * Read every output in a results folder.
 * @returns {{ outputs: Array<{model, arm, case, ext, code, file}>, prompts: Map<string,string>, filesRead: number }}
 */
export function readResults(root) {
  const outputs = [];
  const seen = new Set();
  const prompts = new Map();
  let filesRead = 0;

  for (const file of listFiles(root)) {
    const ext = extname(file).toLowerCase();
    const pathCtx = contextFromPath(root, file);
    const emit = o => {
      const rec = {
        model: o.model || 'unknown-model',
        arm: o.arm || pathCtx.arm || 'unknown',
        case: o.case || 'unknown-case',
        ext: o.ext,
        code: o.code,
        file: relative(root, file),
      };
      const key = createHash('sha1').update(`${rec.model}\0${rec.arm}\0${rec.code}`).digest('hex');
      if (seen.has(key)) return;
      seen.add(key);
      outputs.push(rec);
    };

    if (ext === '.json' || ext === '.jsonl') {
      let text;
      try { text = readFileSync(file, 'utf8'); } catch { continue; }
      const docs = [];
      if (ext === '.json') {
        try { docs.push(JSON.parse(text)); } catch { continue; }
      } else {
        for (const line of text.split('\n')) {
          if (!line.trim()) continue;
          try { docs.push(JSON.parse(line)); } catch { /* skip a bad line */ }
        }
      }
      filesRead++;
      for (const doc of docs) walkJson(doc, {}, emit, prompts);
    } else if (UI_EXTENSIONS.includes(ext)) {
      let code;
      try { code = readFileSync(file, 'utf8'); } catch { continue; }
      filesRead++;
      emit({ ext, code });
    }
  }
  return { outputs, prompts, filesRead };
}
