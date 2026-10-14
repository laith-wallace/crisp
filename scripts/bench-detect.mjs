#!/usr/bin/env node
/**
 * scripts/bench-detect.mjs
 *
 * Measures detector latency, so a rewrite in a faster language is decided by
 * numbers, not instinct (roadmap Phase 4: rewrite only if the median goes
 * over 50 ms). Three measurements:
 *
 *   1. Repo files: each file in the targets (default tests/fixtures and every
 *      HTML asset under skills/) is read and scanned N times; the per-file
 *      figure is the median of those runs.
 *   2. Synthetic tree: 2,000 generated UI files (html, css, tsx, vue, jsx) in a
 *      temp folder, scanned once each, then the whole tree through scan().
 *   3. Cold CLI: `node scripts/detect.mjs <one file>` spawned a few times,
 *      which is what a PostToolUse hook pays (Node start-up included).
 *
 * Usage:
 *   node scripts/bench-detect.mjs                  defaults
 *   node scripts/bench-detect.mjs --runs 20 src/   your own targets
 *   node scripts/bench-detect.mjs --files 5000     bigger synthetic tree
 *   node scripts/bench-detect.mjs --json
 *
 * Nothing here changes the detector; it only times it.
 */

import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync, statSync } from 'node:fs';
import { join, extname, dirname, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { performance } from 'node:perf_hooks';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scan, scanText } from './detector/engine.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function stats(samples) {
  const s = [...samples].sort((a, b) => a - b);
  const at = q => s[Math.min(s.length - 1, Math.max(0, Math.ceil(q * s.length) - 1))];
  return {
    count: s.length,
    medianMs: +at(0.5).toFixed(3),
    p95Ms: +at(0.95).toFixed(3),
    maxMs: +s[s.length - 1].toFixed(3),
    totalMs: +s.reduce((a, b) => a + b, 0).toFixed(1),
  };
}

function walk(dir) {
  const st = statSync(dir);
  if (st.isFile()) return [dir];
  return readdirSync(dir).flatMap(e => (e === 'node_modules' || e.startsWith('.') ? [] : walk(join(dir, e))));
}

// Files the engine has rules for (scanText returns null otherwise).
function scannable(files) {
  return files.filter(f => scanText('', f) !== null);
}

function timeFiles(files, runs) {
  const perFile = [];
  for (const file of files) {
    const runsMs = [];
    for (let i = 0; i < runs; i++) {
      const t0 = performance.now();
      scanText(readFileSync(file, 'utf8'), file);
      runsMs.push(performance.now() - t0);
    }
    perFile.push(stats(runsMs).medianMs);
  }
  return perFile;
}

// Representative files: a realistic page with a few tells, plus plain ones.
const TEMPLATES = {
  '.html': i => `<!doctype html>\n<html lang="en"><head><meta name="viewport" content="width=device-width">\n<style>\n.hero-${i} { background: linear-gradient(135deg, #7c3aed, #2563eb); padding: 4rem; }\n.card { border: 1px solid #eee; box-shadow: 0 20px 60px rgba(0,0,0,.1); transition: all .3s; }\n.card:hover { transform: scale(1.05); }\nbody { font-family: Inter, sans-serif; line-height: 1.6; color: #333; }\n</style></head>\n<body>\n<header><nav><a href="#">Home</a> <a href="/pricing">Pricing</a></nav></header>\n<main>\n<section class="hero-${i}"><span class="pill">New</span><h1>Supercharge your workflow ${i}</h1><p>Seamless and world-class.</p><button>Start</button></section>\n${Array.from({ length: 12 }, (_, k) => `<div class="card"><h3>Feature ${k}</h3><p>Description of feature ${k} for page ${i}.</p><img src="f${k}.png"></div>`).join('\n')}\n</main>\n<footer><p>Footer ${i}</p></footer>\n</body></html>\n`,
  '.css': i => Array.from({ length: 40 }, (_, k) => `.c${i}-${k} { color: #${(k * 2654435761 % 0xffffff).toString(16).padStart(6, '0')}; background: #fff; padding: ${k}px; margin: 0 auto; border-radius: 8px; }\n.c${i}-${k}:focus { outline: none; }`).join('\n'),
  '.tsx': i => `import React from 'react';\n\nexport function Panel${i}({ items }: { items: string[] }) {\n  return (\n    <section className="p-6 rounded-2xl shadow-lg">\n      <h2 className="text-2xl font-semibold">Panel ${i}</h2>\n      <ul>{items.map(x => <li key={x} className="transition-all hover:scale-105">{x}</li>)}</ul>\n      <div onClick={() => console.log(${i})}>Open</div>\n      <button aria-label="Close"><svg /></button>\n    </section>\n  );\n}\n`.repeat(3),
  '.vue': i => `<template>\n  <div class="wrap"><h1>Settings ${i}</h1><input placeholder="Email"><button>Save</button></div>\n</template>\n<script setup>\nconst n = ${i};\n</script>\n<style scoped>\n.wrap { max-width: 40rem; font-size: 15px; }\n</style>\n`,
  '.jsx': i => `export default function Card${i}() {\n  return <div className="card"><h3>Card ${i}</h3><p>Body text.</p><a href="/x">More</a></div>;\n}\n`,
};

function makeSyntheticTree(count) {
  const dir = mkdtempSync(join(tmpdir(), 'crisp-bench-'));
  const exts = Object.keys(TEMPLATES);
  const files = [];
  for (let i = 0; i < count; i++) {
    const ext = exts[i % exts.length];
    const sub = join(dir, `pkg-${i % 20}`, `area-${i % 7}`);
    mkdirSync(sub, { recursive: true });
    const file = join(sub, `file-${i}${ext}`);
    writeFileSync(file, TEMPLATES[ext](i));
    files.push(file);
  }
  return { dir, files };
}

function spawnTimes(args, runs) {
  const samples = [];
  for (let i = 0; i < runs; i++) {
    const t0 = performance.now();
    spawnSync(process.execPath, args, { stdio: 'ignore' });
    samples.push(performance.now() - t0);
  }
  return stats(samples);
}

function coldCli(file, runs) {
  return {
    ...spawnTimes([join(ROOT, 'scripts', 'detect.mjs'), '--no-config', file], runs),
    nodeStartupMedianMs: spawnTimes(['-e', ''], runs).medianMs,
  };
}

export function bench({ targets, runs = 10, files = 2000, cliRuns = 5 } = {}) {
  const repoTargets = targets?.length ? targets : [
    join(ROOT, 'tests', 'fixtures'),
    ...walk(join(ROOT, 'skills')).filter(f => extname(f) === '.html'),
  ];
  const repoFiles = scannable(repoTargets.flatMap(walk));
  const repoPerFile = timeFiles(repoFiles, runs);
  const largest = repoFiles.reduce((best, f) => (statSync(f).size > (best ? statSync(best).size : -1) ? f : best), null);

  const tree = makeSyntheticTree(files);
  try {
    const perFile = timeFiles(tree.files, 1);
    const t0 = performance.now();
    const { filesScanned, findings } = scan([tree.dir]);
    const wholeTreeMs = performance.now() - t0;
    return {
      node: process.version,
      repo: {
        files: repoFiles.map(f => relative(ROOT, f)),
        runsPerFile: runs,
        perFile: repoFiles.length ? stats(repoPerFile) : null,
        largest: largest ? { file: relative(ROOT, largest), bytes: statSync(largest).size } : null,
      },
      synthetic: {
        files: filesScanned,
        findings: findings.length,
        perFile: stats(perFile),
        wholeTreeScanMs: +wholeTreeMs.toFixed(1),
      },
      coldCli: largest ? { file: relative(ROOT, largest), ...coldCli(largest, cliRuns) } : null,
    };
  } finally {
    rmSync(tree.dir, { recursive: true, force: true });
  }
}

function print(r) {
  const row = (label, s) => s ? `  ${label.padEnd(28)} median ${String(s.medianMs).padStart(7)} ms   p95 ${String(s.p95Ms).padStart(7)} ms   max ${String(s.maxMs).padStart(7)} ms` : `  ${label}: no files`;
  console.log(`crisp detector bench (Node ${r.node})\n`);
  console.log(`Repo files (${r.repo.files.length}, median of ${r.repo.runsPerFile} runs each)`);
  console.log(row('per file', r.repo.perFile));
  if (r.repo.largest) console.log(`  largest: ${r.repo.largest.file} (${r.repo.largest.bytes} bytes)`);
  console.log(`\nSynthetic tree (${r.synthetic.files} files, ${r.synthetic.findings} findings)`);
  console.log(row('per file', r.synthetic.perFile));
  console.log(`  sum of per-file times       ${r.synthetic.perFile.totalMs} ms`);
  console.log(`  whole tree via scan()       ${r.synthetic.wholeTreeScanMs} ms (includes directory walk)`);
  if (r.coldCli) {
    console.log(`\nCold CLI on ${r.coldCli.file} (${r.coldCli.count} spawns, Node start-up included)`);
    console.log(row('per run', r.coldCli));
    console.log(`  bare \`node -e ''\` start-up median ${r.coldCli.nodeStartupMedianMs} ms`);
  }
  const worst = Math.max(r.repo.perFile?.medianMs ?? 0, r.synthetic.perFile.medianMs);
  console.log(`\nRoadmap threshold: rewrite only if the per-file median exceeds 50 ms. Worst median here: ${worst} ms.`);
}

function main(argv) {
  const opts = { targets: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--runs') opts.runs = Number(argv[++i]);
    else if (a === '--files') opts.files = Number(argv[++i]);
    else if (a === '--cli-runs') opts.cliRuns = Number(argv[++i]);
    else if (a === '--json') opts.json = true;
    else opts.targets.push(a);
  }
  const r = bench(opts);
  if (opts.json) console.log(JSON.stringify(r, null, 2));
  else print(r);
  return 0;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) process.exitCode = main(process.argv.slice(2));
