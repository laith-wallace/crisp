---
name: crisp-isolate
description: Start every task in its own Git worktree and branch cut from origin/main, after a scope check against open PRs and other agents' uncommitted work - so parallel agents never collide and nothing is built on main. Use at the start of any feature, fix, or task before writing code, and for cleanup once the PR merges. Claude Code and Cursor manage the worktree themselves; the scope check and verification still apply.
user-invocable: true
version: "1.0.0"
metadata:
  author: Laith Wallace - FlowConverts
  adapted-from: michaelshimeles/skills new-feature (worktree-per-task convention)
---

# /crisp-isolate - One Task, One Worktree, One Branch

Two agents editing one checkout is a merge conflict with extra steps. Every task gets its own worktree and branch, cut from the latest `origin/main`, and nothing is ever built on `main`.

## Harness deltas - read first

| Harness | What it already does | What you still do |
|---|---|---|
| Claude Code | Creates and manages worktrees under `.claude/worktrees/<name>` and assigns the branch | Steps 1, 2, and 5. Skip 3 and 4. Keep the assigned branch name. |
| Cursor (branches named `worktree-*`) | Same | Steps 2 and 5. Keep the assigned branch and worktree. |
| Anything else | Nothing | All five steps |

## Steps

### 1. Sync

```bash
git fetch origin
git rev-parse --short origin/main      # the base you will cut from - record it
```

### 2. Scope check

```bash
gh pr list --state open --json number,title,headRefName
gh pr diff <n> --name-only              # for each open PR that sounds related
git status --porcelain                  # uncommitted work in this checkout = another agent mid-task
git worktree list                       # other agents' worktrees
```

Binary outcome:
- Zero overlap between the files your task needs and any open PR's changed files → proceed.
- Any overlap → **stop and ask for direction.** Name the PR and the overlapping files. Never proceed on a guess.
- Uncommitted work in the shared checkout that is not yours → leave it untouched, work only in your own worktree.

### 3. Name the task

`<verb-or-area>-<short-unique-suffix>`, lowercase with hyphens: `deal-filters-0816a`. The suffix makes the name unique across agents. If `git worktree add` says the name exists, pick another suffix - never force, never reuse.

### 4. Create the worktree

From the repo root:

```bash
git worktree add <worktrees-dir>/<task-name> -b <branch-prefix>/<task-name> origin/main
```

Rules:
- `<worktrees-dir>` is gitignored (`.claude/worktrees/`, `.worktrees/`, or the repo's convention). Verify: `git check-ignore <worktrees-dir>` prints the path.
- `<branch-prefix>` is consistent across agents (`agent/`, `feat/`, or the repo's convention).
- The base is always `origin/main`, never a local `main` that may be stale.

### 5. Enter and verify

```bash
cd <worktrees-dir>/<task-name>
git branch --show-current               # must print your branch - never main
git log --oneline -1                    # must match the origin/main sha from step 1
```

Then, inside the worktree:
- Install dependencies fresh. Worktrees do not share `node_modules` or virtualenvs.
- Confirm the runtime version the repo requires (`.nvmrc`, `.tool-versions`, `engines`) before running anything.
- Pick a dev-server port that is free, and confirm it is yours before trusting it: `lsof -i :<port>` then `ps -p <pid> -o args=`.

## Isolation receipt

Print this before writing any code. It is the deliverable of this skill:

```
## Isolated: <task-name>

Branch:     agent/deal-filters-0816a   (not main)
Worktree:   .claude/worktrees/deal-filters-0816a   (gitignored: yes)
Base:       origin/main @ 3f2a9c1
Scope:      0 open PRs touch src/routes/deals/ - checked #212, #215
Deps:       installed fresh, node 22.22.0
Port:       5174 - confirmed own process
```

Any line that cannot be filled honestly is a blocker, not a blank.

## Multi-agent rules

- Never commit to `main`. Never force-push to `main`.
- Never plain `--force` anywhere. `--force-with-lease` only, and only on your own task branch after a rebase.
- Never modify, reuse, or delete another agent's worktree, branch, or uncommitted work.
- Resolve lockfile conflicts by regenerating the lockfile, never by hand-merging it.
- Worktrees do not isolate shared resources: ports, shared databases, and caches are global. Zero schema experiments against a shared database.
- A conflict you cannot resolve with confidence → stop and report. Guessing costs more than asking.

## Cleanup after merge

Keep the worktree until the PR is merged or closed. Then:

```bash
git worktree remove <worktrees-dir>/<task-name>
git branch -D <branch-prefix>/<task-name>
```

`-D` is expected: after a squash or rebase merge, `-d` refuses even though the work is merged. Confirm the PR state first (`gh pr view <n> --json state`) - never delete a branch whose PR is still open.

## What comes next

`/crisp-structure` for where the code goes, `/crisp-evidence` while testing it, `/crisp-proof` and `/crisp-loop` before the PR, `/crisp-unslop` on the PR text.
