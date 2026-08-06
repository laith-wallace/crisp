#!/usr/bin/env node
import { existsSync, mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const LIME = '#c8ff3c';
const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, '..');

// Handle --version flag before any interactive code
if (process.argv.includes('--version') || process.argv.includes('-v')) {
  const pkg = JSON.parse(readFileSync(join(PKG_ROOT, 'package.json'), 'utf8'));
  console.log(`@laith-wallace/crisp v${pkg.version}`);
  process.exit(0);
}

// Non-interactive subcommands short-circuit the installer entirely.
const [subcommand, ...subArgs] = process.argv.slice(2);

if (subcommand === 'detect') {
  const { runDetect } = await import(join(PKG_ROOT, 'scripts', 'detect.mjs'));
  process.exit(runDetect(subArgs));
}

if (subcommand === 'ignores') {
  const { runIgnores } = await import(join(PKG_ROOT, 'scripts', 'ignores-cli.mjs'));
  process.exit(await runIgnores(subArgs));
}

if (subcommand === 'hook') {
  const { runHook } = await import(join(PKG_ROOT, 'scripts', 'hook.mjs'));
  await runHook();
  process.exit(0); // hooks never fail the tool call, whatever happened inside
}

if (subcommand === 'critique') {
  const { runCritiqueStorage } = await import(join(PKG_ROOT, 'scripts', 'critique-storage.mjs'));
  process.exit(await runCritiqueStorage(subArgs));
}

if (subcommand === 'doctor') {
  const { runDoctor } = await import(join(PKG_ROOT, 'scripts', 'doctor.mjs'));
  process.exit(await runDoctor(subArgs));
}

const SKILLS = [
  // Core skills
  { value: 'crisp-teach',    label: '/crisp-teach',    hint: 'Onboard your AI to your product — writes .crisp.md' },
  { value: 'crisp-review',   label: '/crisp-review',   hint: '30-second design scan, A–F grade, top 3 issues' },
  { value: 'crisp-audit',    label: '/crisp-audit',    hint: 'Full CRISP evaluation across 5 dimensions' },
  { value: 'feature-design', label: '/feature-design', hint: 'Design new features using CRISP principles' },
  { value: 'handoff',        label: '/handoff',        hint: 'Convert designs to developer-ready specs' },
  // CRISP Extensions
  { value: 'crisp-brief',    label: '/crisp-brief',    hint: 'Turn vague requests into structured design briefs' },
  { value: 'crisp-copy',     label: '/crisp-copy',     hint: 'Write and evaluate all UI microcopy' },
  { value: 'crisp-a11y',     label: '/crisp-a11y',     hint: 'Full WCAG 2.2 AA accessibility audit' },
  { value: 'crisp-ai',       label: '/crisp-ai',       hint: 'Evaluate and design AI-native UI surfaces' },
  { value: 'crisp-research',    label: '/crisp-research',    hint: 'Research synthesis — patterns, anti-patterns, brief gaps' },
  { value: 'crisp-design-eng', label: '/crisp-design-eng', hint: 'Motion decisions, micro-interaction quality, and invisible polish' },
  { value: 'crisp-doctor',     label: '/crisp-doctor',     hint: 'Check .crisp.md and .crisp/config.json for drift' },
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

// The interactive installer's UI deps are loaded lazily, here, rather than
// at module top-level. `crisp detect`/`crisp ignores` exit before reaching
// this function, so they never pay for or require @clack/prompts, chalk, or
// figlet — that's the whole point of the detector being dependency-free.
async function main() {
  const [p, { default: chalk }, { default: figlet }] = await Promise.all([
    import('@clack/prompts'),
    import('chalk'),
    import('figlet'),
  ]);

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

  // The design-detector hook is Claude Code-specific for now (PostToolUse
  // hooks in .claude/settings.local.json) — Cursor and Gemini CLI use
  // different hook formats this installer doesn't write yet.
  if (selectedAgentValues.includes('claude')) {
    await offerClaudeHook(p, chalk);
  }

  p.outro(
    chalk.hex(LIME)('Done.') +
    chalk.dim(' Run ') +
    chalk.hex(LIME)('/crisp-teach') +
    chalk.dim(' in your agent to get started.')
  );
}

const HOOK_COMMAND = 'npx @laith-wallace/crisp hook';

async function offerClaudeHook(p, chalk) {
  const settingsPath = join(process.cwd(), '.claude', 'settings.local.json');

  let settings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
    } catch {
      console.log('\n' + chalk.red(`  ✗ .claude/settings.local.json exists but isn't valid JSON — skipping hook install.`));
      return;
    }
  }

  const postToolUse = settings.hooks?.PostToolUse ?? [];
  const alreadyInstalled = postToolUse.some(entry =>
    entry.hooks?.some(h => h.command === HOOK_COMMAND)
  );

  if (alreadyInstalled) {
    console.log('\n' + chalk.dim('  Design-detector hook already installed in this project.'));
    return;
  }

  const install = await p.confirm({
    message: 'Install the design-detector hook for this project? Runs `crisp detect` after every UI file edit (Edit/Write) and surfaces findings automatically.',
    initialValue: true,
  });

  if (p.isCancel(install) || !install) {
    console.log('\n' + chalk.dim('  Skipped the hook. Run this installer again anytime to add it.'));
    return;
  }

  settings.hooks = settings.hooks ?? {};
  settings.hooks.PostToolUse = postToolUse;
  postToolUse.push({
    matcher: 'Edit|Write',
    hooks: [{ type: 'command', command: HOOK_COMMAND }],
  });

  try {
    mkdirSync(dirname(settingsPath), { recursive: true });
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
    console.log('\n' + chalk.hex(LIME)('  ✓') + chalk.dim(` Hook installed: ${settingsPath}`));
  } catch (e) {
    console.log('\n' + chalk.red(`  ✗ Could not write ${settingsPath}: ${e.message}`));
  }
}

main().catch(e => {
  console.error('Error: ' + e.message);
  process.exit(1);
});
