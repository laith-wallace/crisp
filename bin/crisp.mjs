#!/usr/bin/env node
import * as p from '@clack/prompts';
import chalk from 'chalk';
import figlet from 'figlet';
import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const LIME = '#c8ff3c';
const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');

const SKILLS = [
  { value: 'crisp-teach',    label: '/crisp-teach',    hint: 'Onboard your AI to your product — writes .crisp.md' },
  { value: 'crisp-review',   label: '/crisp-review',   hint: '30-second design scan, A–F grade, top 3 issues' },
  { value: 'crisp-audit',    label: '/crisp-audit',    hint: 'Full CRISP evaluation across 5 dimensions' },
  { value: 'feature-design', label: '/feature-design', hint: 'Design new features using CRISP principles' },
  { value: 'handoff',        label: '/handoff',        hint: 'Convert designs to developer-ready specs' },
];

const AGENTS = [
  {
    value: 'claude',
    label: 'Claude Code',
    hint: '~/.claude/skills/',
    src: join(PKG_ROOT, '.claude', 'skills'),
    dest: () => join(homedir(), '.claude', 'skills'),
    detect: () => existsSync(join(homedir(), '.claude')),
  },
  {
    value: 'cursor',
    label: 'Cursor',
    hint: '.cursor/rules/ (current project)',
    src: join(PKG_ROOT, '.cursor', 'rules'),
    dest: () => join(process.cwd(), '.cursor', 'rules'),
    detect: () => existsSync(join(process.cwd(), '.cursor')) || existsSync(join(homedir(), '.cursor')),
  },
  {
    value: 'antigravity',
    label: 'Antigravity',
    hint: '~/.agents/skills/',
    src: join(PKG_ROOT, '.agents', 'skills'),
    dest: () => join(homedir(), '.agents', 'skills'),
    detect: () => existsSync(join(homedir(), '.agents')),
  },
  {
    value: 'gemini',
    label: 'Gemini CLI',
    hint: '~/.gemini/skills/',
    src: join(PKG_ROOT, '.gemini', 'skills'),
    dest: () => join(homedir(), '.gemini', 'skills'),
    detect: () => existsSync(join(homedir(), '.gemini')),
  },
  {
    value: 'manual',
    label: 'Manual copy',
    hint: 'Show file paths — copy yourself',
    src: join(PKG_ROOT, 'files'),
    dest: () => null,
    detect: () => false,
  },
];

function logo() {
  const art = figlet.textSync('CRISP', { font: 'ANSI Shadow' });
  return chalk.hex(LIME)(art);
}

function cancelIfNeeded(value) {
  if (p.isCancel(value)) {
    p.cancel('Installation cancelled.');
    process.exit(0);
  }
  return value;
}

async function main() {
  console.log('\n' + logo());
  console.log(chalk.hex(LIME).dim('  Design Intelligence for AI Agents\n'));

  p.intro(chalk.hex(LIME)('CRISP Installer'));

  // Skill selection
  const selectedSkills = cancelIfNeeded(
    await p.multiselect({
      message: 'Which skills do you want to install?',
      options: SKILLS.map(s => ({ ...s, initialChecked: true })),
      initialValues: SKILLS.map(s => s.value),
      required: true,
    })
  );

  // Agent selection — pre-select detected agents
  const detectedValues = AGENTS.filter(a => a.detect()).map(a => a.value);

  const selectedAgentValues = cancelIfNeeded(
    await p.multiselect({
      message: 'Install to which agents?',
      options: AGENTS.map(a => ({
        value: a.value,
        label: a.label,
        hint: a.detect()
          ? chalk.hex(LIME)('✓ detected') + chalk.dim('  ' + a.hint)
          : chalk.dim(a.hint),
      })),
      initialValues: detectedValues.length > 0 ? detectedValues : ['manual'],
      required: true,
    })
  );

  const selectedAgents = AGENTS.filter(a => selectedAgentValues.includes(a.value));
  const results = {};

  const spinner = p.spinner();
  spinner.start('Installing skills…');

  for (const agent of selectedAgents) {
    results[agent.value] = { agent, files: [] };

    if (agent.value === 'manual') continue;

    const dest = agent.dest();
    try {
      mkdirSync(dest, { recursive: true });
    } catch (e) {
      results[agent.value].error = `Could not create ${dest}: ${e.message}`;
      continue;
    }

    for (const skill of selectedSkills) {
      const src = join(agent.src, skill + '.md');
      const dst = join(dest, skill + '.md');
      try {
        copyFileSync(src, dst);
        results[agent.value].files.push({ skill, path: dst, ok: true });
      } catch (e) {
        results[agent.value].files.push({ skill, path: dst, ok: false, error: e.message });
      }
    }
  }

  spinner.stop(chalk.hex(LIME)('Skills installed'));

  // Summary
  for (const [, { agent, files, error }] of Object.entries(results)) {
    if (agent.value === 'manual') {
      console.log('\n' + chalk.dim('  ── Manual copy ──'));
      for (const skill of selectedSkills) {
        const src = join(agent.src, skill + '.md');
        console.log('  ' + chalk.dim(src));
      }
      continue;
    }

    if (error) {
      console.log('\n' + chalk.red(`  ✗ ${agent.label}: ${error}`));
      continue;
    }

    console.log('\n' + chalk.dim(`  ── ${agent.label} ──`));
    for (const f of files) {
      if (f.ok) {
        console.log('  ' + chalk.hex(LIME)('✓') + ' ' + chalk.dim(f.path));
      } else {
        console.log('  ' + chalk.red('✗') + ' ' + f.skill + chalk.red(` — ${f.error}`));
      }
    }
  }

  p.outro(
    chalk.hex(LIME)('Done.') +
    chalk.dim(' Run ') +
    chalk.hex(LIME)('/crisp-teach') +
    chalk.dim(' in your agent to get started.')
  );
}

main().catch(e => {
  console.error(chalk.red('Error: ' + e.message));
  process.exit(1);
});
