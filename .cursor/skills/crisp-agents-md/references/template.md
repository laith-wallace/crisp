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
