#!/usr/bin/env node
import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
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

// Exit only after stdout drains, so large --json output is never cut off when piped.
async function exitAfterFlush(code) {
  await new Promise(resolve => process.stdout.write('', resolve));
  process.exit(code);
}

// Non-interactive subcommands short-circuit the installer entirely.
const [subcommand, ...subArgs] = process.argv.slice(2);

if (subcommand === 'detect') {
  const { runDetect } = await import(join(PKG_ROOT, 'scripts', 'detect.mjs'));
  await exitAfterFlush(runDetect(subArgs));
}

if (subcommand === 'ignores') {
  const { runIgnores } = await import(join(PKG_ROOT, 'scripts', 'ignores-cli.mjs'));
  process.exit(await runIgnores(subArgs));
}

if (subcommand === 'hook') {
  const { runHook } = await import(join(PKG_ROOT, 'scripts', 'hook.mjs'));
  await runHook(subArgs);
  process.exit(0); // hooks never fail the tool call, whatever happened inside
}

if (subcommand === 'critique') {
  const { runCritiqueStorage } = await import(join(PKG_ROOT, 'scripts', 'critique-storage.mjs'));
  process.exit(await runCritiqueStorage(subArgs));
}

if (subcommand === 'design-md') {
  const { runDesignMd } = await import(join(PKG_ROOT, 'scripts', 'design-md.mjs'));
  await exitAfterFlush(await runDesignMd(subArgs));
}

if (subcommand === 'help' || process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`@laith-wallace/crisp

  crisp                               interactive installer (skills + optional hooks)
  crisp detect [--json] <path...>     run the design detector (exit 0 clean, 2 findings, 1 error)
  crisp hook [--stop]                 Claude Code hook entry (reads the hook payload on stdin)
  crisp ignores list|add-file|add-value   manage .crisp/config.json detector ignores
  crisp design-md lint [file] [--json]    lint a DESIGN.md (tokens, references, contrast)
  crisp design-md diff <old> <new>        token-level diff of two DESIGN.md files
  crisp critique slug|write|trend     per-surface review history in .crisp/critique/
  crisp doctor [--fix]                check .crisp.md and .crisp/config.json for drift
  crisp --version`);
  process.exit(0);
}

if (subcommand === 'doctor') {
  const { runDoctor } = await import(join(PKG_ROOT, 'scripts', 'doctor.mjs'));
  process.exit(await runDoctor(subArgs));
}

// Every folder under skills/ with a SKILL.md is a skill; the hint is the
// first clause of its description, so the list can never fall out of date.
const SKILLS_SRC = join(PKG_ROOT, 'skills');
const SKILLS = readdirSync(SKILLS_SRC)
  .filter(name => name !== '_shared' && existsSync(join(SKILLS_SRC, name, 'SKILL.md')))
  .map(name => {
    const text = readFileSync(join(SKILLS_SRC, name, 'SKILL.md'), 'utf8');
    const description = (text.match(/^description:\s*(.*)$/m)?.[1] ?? '').replace(/^["']|["']$/g, '');
    const hint = description.split(/ - |\. /)[0].slice(0, 70);
    return { value: name, label: `/${name}`, hint };
  });

const AGENTS = [
  {
    value: 'claude',
    label: 'Claude Code',
    hint: '~/.claude/skills/',
    dest: () => join(homedir(), '.claude', 'skills'),
    detect: () => existsSync(join(homedir(), '.claude')),
  },
  {
    value: 'agents',
    label: 'Codex, Copilot, Antigravity',
    hint: '~/.agents/skills/ (shared agent skills folder)',
    dest: () => join(homedir(), '.agents', 'skills'),
    detect: () => existsSync(join(homedir(), '.agents')) || existsSync(join(homedir(), '.codex')),
  },
  {
    value: 'cursor',
    label: 'Cursor',
    hint: '~/.cursor/skills/',
    dest: () => join(homedir(), '.cursor', 'skills'),
    detect: () => existsSync(join(homedir(), '.cursor')),
  },
  {
    value: 'gemini',
    label: 'Gemini CLI',
    hint: '~/.gemini/skills/',
    dest: () => join(homedir(), '.gemini', 'skills'),
    detect: () => existsSync(join(homedir(), '.gemini')),
  },
  {
    value: 'manual',
    label: 'Manual copy',
    hint: 'Show folder paths - copy yourself',
    dest: () => null,
    detect: () => false,
  },
];

// The interactive installer's UI deps are loaded lazily, here, rather than
// at module top-level. `crisp detect`/`crisp ignores` exit before reaching
// this function, so they never pay for or require @clack/prompts, chalk, or
// figlet - that's the whole point of the detector being dependency-free.
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

  // Agent selection - pre-select detected agents
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
      const src = join(SKILLS_SRC, skill);
      const dst = join(dest, skill);
      try {
        cpSync(src, dst, { recursive: true, force: true });
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
        console.log('  ' + chalk.dim(join(SKILLS_SRC, skill) + '/'));
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
        console.log('  ' + chalk.red('✗') + ' ' + f.skill + chalk.red(` - ${f.error}`));
      }
    }
  }

  // The design-detector hook is Claude Code-specific for now (PostToolUse
  // hooks in .claude/settings.local.json) - Cursor and Gemini CLI use
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
const STOP_HOOK_COMMAND = 'npx @laith-wallace/crisp hook --stop';

function hasCommand(entries, command) {
  return (entries ?? []).some(entry => entry.hooks?.some(h => h.command === command));
}

async function offerClaudeHook(p, chalk) {
  const settingsPath = join(process.cwd(), '.claude', 'settings.local.json');

  let settings = {};
  if (existsSync(settingsPath)) {
    try {
      settings = JSON.parse(readFileSync(settingsPath, 'utf8'));
    } catch {
      console.log('\n' + chalk.red(`  ✗ .claude/settings.local.json exists but isn't valid JSON - skipping hook install.`));
      return;
    }
  }

  const hasPost = hasCommand(settings.hooks?.PostToolUse, HOOK_COMMAND);
  const hasStop = hasCommand(settings.hooks?.Stop, STOP_HOOK_COMMAND);
  if (hasPost && hasStop) {
    console.log('\n' + chalk.dim('  Design-detector hooks already installed in this project.'));
    return;
  }

  const install = await p.confirm({
    message: 'Install the design-detector hooks for this project? After each UI file edit they report only the issues that edit added, and before the agent stops they check all changed UI files once.',
    initialValue: true,
  });

  if (p.isCancel(install) || !install) {
    console.log('\n' + chalk.dim('  Skipped the hooks. Run this installer again anytime to add them.'));
    return;
  }

  settings.hooks = settings.hooks ?? {};
  if (!hasPost) {
    settings.hooks.PostToolUse = settings.hooks.PostToolUse ?? [];
    settings.hooks.PostToolUse.push({
      matcher: 'Edit|Write|MultiEdit',
      hooks: [{ type: 'command', command: HOOK_COMMAND }],
    });
  }
  if (!hasStop) {
    settings.hooks.Stop = settings.hooks.Stop ?? [];
    settings.hooks.Stop.push({ hooks: [{ type: 'command', command: STOP_HOOK_COMMAND }] });
  }

  try {
    mkdirSync(dirname(settingsPath), { recursive: true });
    writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
    console.log('\n' + chalk.hex(LIME)('  ✓') + chalk.dim(` Hooks installed: ${settingsPath}`));
  } catch (e) {
    console.log('\n' + chalk.red(`  ✗ Could not write ${settingsPath}: ${e.message}`));
  }
}

main().catch(e => {
  console.error('Error: ' + e.message);
  process.exit(1);
});
