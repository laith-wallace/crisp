---
name: crisp-agents-md
description: Generate or refresh a repo's AGENTS.md - the workflow file every coding agent reads before it touches the code. Discovers the installed skills and the repo's real facts (scripts, stack, CI, env var names), maps them onto the CRISP workflow chain (Isolate, Scope, Build, Prove, Ship, Write), and writes managed sections it can regenerate later without touching hand-written rules. Use for 'write an AGENTS.md', 'agent workflow file', 'set this repo up for agents', or when skills changed and the table is stale.
user-invocable: true
version: "1.0.0"
metadata:
  author: Laith Wallace - FlowConverts
  inspired-by: michaelshimeles/skills AGENTS.md (workflow-beats structure)
---

# /crisp-agents-md - Your AGENTS.md, Generated From Facts

`AGENTS.md` is the file Codex, Cursor, Copilot, Gemini CLI, and Claude Code (through a one-line `@AGENTS.md` include in `CLAUDE.md`) read at the start of every session. It tells an agent how work moves through this repo: which skill runs at each beat, which checks must pass, what it must never do. A stale or generic one is worse than none, because agents follow it.

This skill writes one from evidence. It never invents a command, a skill, or a rule. Everything it cannot find becomes a marked TODO that the summary lists.

Load `.crisp.md` if it exists. Its product context, register, and History feed the Build and Prove beats.

## Modes

Infer the mode from the file system. Declare it in one line and proceed.

| Mode | Trigger | Deliverable |
|---|---|---|
| **Create** | No `AGENTS.md` at the repo root | A complete `AGENTS.md` plus the `CLAUDE.md` include line |
| **Refresh** | `AGENTS.md` exists with managed markers | Managed sections regenerated, hand-written text untouched, a diff summary |
| **Adopt** | `AGENTS.md` exists without managed markers | Managed sections appended below the existing text, nothing above them edited |
| **Check** | "is my AGENTS.md stale?", "check", "dry run" | A drift report. Zero writes. |

## Step 0 - Discover (facts, never questions)

Run before writing anything. Every fact below is looked up, not asked for. Save the output; the Verify step greps against it.

```bash
# Skill inventory - every slash command an agent in this repo can actually call
for d in ~/.claude/skills .claude/skills .agents/skills ~/.agents/skills; do
  [ -d "$d" ] && for s in "$d"/*/; do
    f="$s/SKILL.md"; [ -f "$f" ] && printf '%s\t%s\n' "$(basename "$s")" "$(grep -m1 '^description:' "$f" | cut -c14-120)"
  done
done | sort -u > /tmp/agents-md-skills.tsv
ls .cursor/rules/*.md 2>/dev/null | xargs -n1 basename 2>/dev/null | sed 's/\.md$//' >> /tmp/agents-md-skills.tsv

# Repo facts
git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null || echo "main"      # default branch
ls package.json pnpm-lock.yaml yarn.lock package-lock.json bun.lockb Makefile Cargo.toml pyproject.toml go.mod 2>/dev/null
node -e 'const s=require("./package.json").scripts||{};for(const k in s)console.log(k+"\t"+s[k])' 2>/dev/null   # scripts
node -e 'const p=require("./package.json");console.log(Object.keys({...p.dependencies,...p.devDependencies}).join("\n"))' 2>/dev/null | grep -iE "^(next|react|vue|svelte|astro|vitest|jest|playwright|cypress|convex|prisma|drizzle|tailwindcss|typescript|eslint|biome)$"
ls .github/workflows 2>/dev/null                                                    # CI
grep -hoE '^[A-Z][A-Z0-9_]+=' .env.example .env.sample .env.template 2>/dev/null | tr -d = | sort -u   # env NAMES only
ls AGENTS.md CLAUDE.md .crisp.md .cursor/rules 2>/dev/null
grep -c 'crisp-agents-md:begin' AGENTS.md 2>/dev/null                              # managed markers present?
grep -n '^## ' ~/.claude/CLAUDE.md 2>/dev/null                                      # global rules other agents cannot see
command -v ffmpeg >/dev/null && echo 'ffmpeg present' || echo 'ffmpeg absent'      # /crisp-evidence recorder
```

Never open `.env`, `.env.local`, or any file that holds values. Names come from example files only. If no example file exists, the Environment section becomes a TODO.

## Step 1 - Map the beats to the CRISP workflow chain

Every task in the generated file moves through the same beats. This is the house chain; each beat names exactly one CRISP skill, checked against the inventory from Step 0. When a skill is not installed, write the fallback as plain instruction and do not mention the slash command.

| Beat | CRISP skill | What it does in the file | Fallback when not installed |
|---|---|---|---|
| **Isolate** | `/crisp-isolate` | Own worktree and branch from `origin/<default>` after a scope check against open PRs and other agents' uncommitted work | "One branch per task from `origin/<default>`. Never build on `<default>`. Check open PRs for overlap first." |
| **Scope** | `/crisp-brief` | Only when the request is vague - writes `.brief.md` with success criteria and scope. A clear bug fix skips this beat | "Restate the task as one sentence plus an observable done-condition before editing" |
| **Build** | `/crisp-structure` | Actions own the why and when, a service layer owns the how. Decides where new code goes and flags copy-pasted mechanics | "Smallest change that passes the checks. Match the surrounding code. No duplicated mechanics." |
| **Prove** | `/crisp-evidence` | Runtime proof: recorded session with passed / failed / untested assertions, `report.md` and `manifest.json` for the PR. Capture the before while the bug still reproduces | "Run the checks. Capture before and after evidence while the bug still reproduces." |
| **Ship** | `/crisp-proof`, then `/crisp-loop` | Before and after pairs with grades on both sides in the PR body, then review-fix-review until the target grade with zero P0 | "Plain-language PR body: what changed, how it was tested, risks. Present the PR URL." |
| **Write** | `/crisp-unslop` | Runs over every human-facing text before it ships: commit messages, PR title and body, doc edits, the closing reply | "No em dashes, no filler openers, no recap endings, active voice." |

UI extras, added to the beat when the repo has a UI and the skill is installed: `/feature-design` on Build for new UI features, `/crisp-copy` on Build for any user-facing string, `/crisp-a11y` on Prove where inputs or forms changed, `/crisp-production-ready` on Ship for launch-tagged work.

Non-UI repos (CLI, API, library) keep all six beats and drop only the UI extras. Say which applies in the intro line of the Workflow section.

Recorder note for Prove: `/crisp-evidence` records video only when `ffmpeg` is on the machine. Check with `command -v ffmpeg`. When absent, the file says so and names the screenshot fallback, so the agent does not stall on a missing tool.

## Step 2 - Ask only for decisions

At most two questions, one at a time, and only when Step 0 could not answer them:

1. "What must an agent never do in this repo?" Skip if `CLAUDE.md`, `.cursor/rules`, or the global rules already list hard invariants for this stack.
2. "What cannot be tested locally?" Skip if the repo has no external services (no env names ending in `_URL`, `_KEY`, `_SECRET`, `_TOKEN`).

If the user says "just write it", skip both and mark the sections as TODO.

## Step 3 - Write from the template

Use `references/template.md`. It has fixed sections and managed blocks. Managed blocks sit between markers and are the only text Refresh mode may rewrite:

```
<!-- crisp-agents-md:begin skills -->
...
<!-- crisp-agents-md:end skills -->
```

Managed blocks: `workflow`, `commands`, `environment`, `skills`. Everything else is written once in Create mode and belongs to the user afterwards.

Binary rules. Each is checked in Step 5:

1. Zero em dashes in the file. Use " - " or end the sentence.
2. Every `/skill-name` mentioned exists in the Step 0 inventory. No phantom commands.
3. Every command in Commands & checks exists in `package.json` scripts, a `Makefile` target, or is a bare tool the lockfile proves is installed (for example `tsc --noEmit` when `typescript` is a dependency). Quote the exact invocation with the repo's package manager.
4. Env vars appear as names only. Zero values, zero example values.
5. File length under 200 lines. Agents load this every session. Long material goes in a linked doc, not here.
6. Every gap is written as `<!-- TODO: what is missing -->` and listed in the summary. Zero unmarked placeholders such as "list commands here".
7. Global rules pulled from `~/.claude/CLAUDE.md` are summarised into Hard invariants only when they apply to this repo's stack (a Next.js rule does not enter a Rust repo), and are marked `(from global rules)` so the user knows other agents now see them too.
8. The Multi-agent rules and Completing a task sections keep their order. Add lines, never remove one.

## Step 4 - Wire into Claude Code

Claude Code reads `CLAUDE.md`, not `AGENTS.md`. Make both agents see one file:

- No `CLAUDE.md`: write one containing the single line `@AGENTS.md`.
- `CLAUDE.md` exists without that line: append it under a blank line.
- `CLAUDE.md` already includes it: do nothing and say so.

Never move existing `CLAUDE.md` content into `AGENTS.md`. That is the user's call.

## Step 5 - Verify

```bash
grep -c "—" AGENTS.md                                                     # must be 0
grep -oE '`/[a-z0-9-]+`' AGENTS.md | tr -d '`/' | sort -u | while read s; do
  grep -q "^$s	" /tmp/agents-md-skills.tsv || echo "PHANTOM SKILL: /$s"; done   # must print nothing
wc -l < AGENTS.md                                                         # under 200
grep -c "TODO:" AGENTS.md                                                 # matches the count in your summary
grep -qE '^@AGENTS\.md$' CLAUDE.md && echo "CLAUDE.md wired"
```

Any failure: fix and re-run. Do not deliver with a phantom skill or an em dash.

## Refresh mode

1. Re-run Step 0.
2. Rebuild only the four managed blocks.
3. Diff the old and new block contents. Report added skills, removed skills, changed commands.
4. Text outside the markers is never touched, even when it is wrong. Report what looks wrong instead: "Hard invariants mentions `npm test` but the script is now `pnpm test`."

## Output

```
## AGENTS.md: [Create / Refresh / Adopt / Check] - [repo name]

**Stack:** [package manager] · [framework or "none detected"] · [test runner] · CI: [yes / no]
**Skills wired:** [N] of 6 beats have an installed skill; [list the beats on fallback text] · ffmpeg: [present / absent, screenshot fallback]
**Written:** AGENTS.md ([N] lines) · CLAUDE.md [created / include appended / already wired]

**TODOs left in the file** (omit if none)
- Environment: no .env.example found
- Untestable locally: not answered

**Managed block changes** (Refresh only)
- skills: +crisp-unslop, -greploop
- commands: `npm run build` → `pnpm build`
```

Zero TODOs and zero changes are valid results. Say so in one line.

## Examples of good vs weak output

**Weak:** A Ship beat that says "Run `/crisp-loop` until grade A" in a repo where the pack is not installed. The agent will try, fail, and improvise.
**Good:** "Open the PR with before and after evidence in the body. Present the PR URL." Plain, true, followable.

**Weak:** `DATABASE_URL=postgres://user:pass@host/db` in the Environment section.
**Good:** `DATABASE_URL` - Postgres connection, set in Vercel, never committed.

**Weak:** Copying the whole global CLAUDE.md into Hard invariants for a Python CLI repo.
**Good:** Two lines: "Never return raw error objects from an endpoint (from global rules)" and "Run `npm audit` before deploy (from global rules)", because only those apply.

## Longitudinal tracking

After delivery, append one line to the `## History` section of `.crisp.md` if it exists. Get the date from `date +%Y-%m-%d`, never from memory:

```
- [YYYY-MM-DD] | /crisp-agents-md | [Create/Refresh/Adopt/Check] | AGENTS.md | [N]/6 beats wired, [N] TODOs
```


---

<!-- references/template.md -->

# AGENTS.md template - /crisp-agents-md

Fill every `{{placeholder}}` from Step 0 facts or Step 2 answers. A placeholder with no source becomes `<!-- TODO: ... -->`. Text between `begin`/`end` markers is managed; Refresh mode rewrites only those blocks.

---

```markdown
# Agent workflow

Every task in this repo moves through five beats. Each beat names the skill that runs it when one is installed, and the plain rule when none is. This file is read by every coding agent at session start; keep it under 200 lines and put long material in linked docs.

<!-- crisp-agents-md:begin workflow -->
## Workflow

{{one line: "UI product - all six beats plus the UI extras apply" or "Non-UI repo (CLI/API/library) - six beats, UI extras dropped"}}

1. **Isolate - {{`/crisp-isolate`}}.** Every task starts in its own worktree and branch cut from `origin/{{default_branch}}`, after a scope check against open PRs and other agents' uncommitted work. Never build on `{{default_branch}}`. {{fallback: One branch per task. Check `gh pr list` for overlap first.}}
2. **Scope - {{`/crisp-brief`}}.** When the request is vague, write `.brief.md` with an observable done-condition and scope boundaries before touching code. A clear bug fix skips this beat. {{fallback: Restate the task as one sentence plus a done-condition.}}
3. **Build - {{`/crisp-structure`}}.** Actions own the why and when; a service layer owns the how, with explicit inputs and structured returns. Ask it where new code belongs before writing it. {{UI extras: `/feature-design` for new UI features, `/crisp-copy` for any user-facing string.}} {{fallback: Smallest change that passes the checks. No duplicated mechanics.}}
4. **Prove - {{`/crisp-evidence`}}.** Run the checks below, then record runtime proof: drive the app live, annotate each assertion passed / failed / untested, and keep `report.md` and `manifest.json` for the PR. Capture the before state while the bug still reproduces. {{ffmpeg line: "ffmpeg is installed; the recorder captures video" or "ffmpeg is not installed; the recorder falls back to numbered screenshots. Install with `brew install ffmpeg`."}} {{UI extra: `/crisp-a11y` where inputs or forms changed.}}
5. **Ship - {{`/crisp-proof`, then `/crisp-loop`}}.** Put before and after pairs with grades on both sides in the PR body. Run the review-fix-review loop until the target grade with zero P0. {{UI extra: `/crisp-production-ready` for launch-tagged work.}} Finish by presenting the PR URL. {{fallback: Plain-language PR body: what changed, how it was tested, risks.}}
6. **Write - {{`/crisp-unslop`}}.** Run it over anything a person will read before you commit, post, or send it: commit messages, PR title and body, README and doc edits, code comments, the closing reply. Apply it to text you wrote or changed, never to prose you did not touch. {{fallback: No em dashes, no filler openers, no recap endings, active voice, sentence-case headings.}}
<!-- crisp-agents-md:end workflow -->

## Multi-agent rules

- Never commit directly to `{{default_branch}}`.
- One branch per task and per agent. Never modify another agent's branch, worktree, or uncommitted work.
- Scope check before starting: skim open PRs' changed files (`gh pr list`, `gh pr diff <n> --name-only`). On overlap, stop and ask.
- Never force-push to `{{default_branch}}`. Never plain `--force` anywhere; only `--force-with-lease`, only on your own task branch.
- Resolve lockfile conflicts by regenerating with `{{package_manager}} install`, never by hand-merging.
- Confirm a dev-server port answers *your* process before trusting it. Do not run schema experiments against a shared database.
- If a conflict cannot be resolved confidently, stop and report instead of guessing.

## Completing a task

1. Keep changes limited to the assigned task.
2. Run every command in Commands & checks. All must pass.
3. Assemble the evidence captured along the way: the `/crisp-evidence` report and the `/crisp-proof` before and after pairs.
4. Commit with a clear message, rebase onto the latest `origin/{{default_branch}}`, and rerun the checks.
5. Push with `git push -u origin <branch>`. After rebasing an already-pushed branch, `--force-with-lease`.
6. Open the PR. The body states what changed, how it was tested with evidence for every claim, before and after proof, and any risks or follow-up work. Run the title and body through the Write beat before posting.
7. Run the Ship loop until the target grade with zero P0.
8. End by presenting the PR URL.

Do not merge the PR unless explicitly instructed. Keep the branch until the PR is merged or closed.

<!-- crisp-agents-md:begin commands -->
## Commands & checks

| Purpose | Command |
|---|---|
| Install | `{{pm}} install` |
| Build | `{{pm}} run build` |
| Typecheck | `{{pm}} exec tsc --noEmit` |
| Lint | `{{pm}} run lint` |
| Test | `{{pm}} run test` |
| Dev server | `{{pm}} run dev` |

{{Only rows whose script or tool exists. Missing rows are dropped, not invented. If none exist: <!-- TODO: no scripts found in package.json - add build and test commands -->}}
<!-- crisp-agents-md:end commands -->

## Hard invariants

{{Repo-specific rules from Step 2, then global rules that apply to this stack, each suffixed "(from global rules)". If nothing: <!-- TODO: what must an agent never do here? -->}}

<!-- crisp-agents-md:begin environment -->
## Environment quick reference

| Variable | What it is | Where it lives |
|---|---|---|
| `{{NAME}}` | {{purpose from name or comment in .env.example}} | {{.env.local / Vercel / CI secret}} |

Names only. Values are never written here. {{If no example file: <!-- TODO: no .env.example found - list required env var names -->}}
<!-- crisp-agents-md:end environment -->

## Cannot be tested locally

{{Step 2 answer, or: <!-- TODO: list what needs a deployed environment (webhooks, payment provider, email delivery) -->}}

<!-- crisp-agents-md:begin skills -->
## Skill sources

| Skill | Source |
|---|---|
| {{`crisp-isolate`, `crisp-brief`, `crisp-structure`, `crisp-evidence`, `crisp-proof`, `crisp-loop`, `crisp-unslop`, and any UI extras found}} | `@laith-wallace/crisp` - `npx skills add laith-wallace/crisp` |
| {{other installed skill}} | {{path or package it came from}} |
<!-- crisp-agents-md:end skills -->
```
