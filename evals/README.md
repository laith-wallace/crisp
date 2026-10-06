# CRISP plugin evals

Automated eval suite for `claude plugin eval` (Claude Code v2.1.269 or later, git 2.31 or later). Format reference: https://code.claude.com/docs/en/plugin-evals

Every case is a directory holding a `prompt.md` (frontmatter = run limits, body = the prompt) and a `graders/` folder (one grader per `.md` file). Graded cases add a `case.yaml` for `context.*` fields. Cases are grouped under non-case folders:

| Folder | Cases | What it measures |
|---|---|---|
| `triggering/<skill>/` | 29 | A natural request (no skill name in it) makes Claude invoke that skill. One free `tool_used: Skill` grader each |
| `negative/<name>/` | 5 | Ordinary coding requests where no CRISP skill may fire. `tool_used` with `min: 0`, `max: 0`, `arm: both` |
| `graded/<name>/` | 7 | Output quality on the regression fixtures in `tests/fixtures/`, graded against `tests/expected/` |

Graded cases:

| Case | Skill | Fixture | Expected |
|---|---|---|---|
| `design-eng-janky-css` | crisp-design-eng | `janky-component.css` | `tests/expected/janky-component.md` |
| `copy-weak-strings` | crisp-copy | `weak-copy.md` | `tests/expected/weak-copy.md` |
| `unslop-slop-prose` | crisp-unslop (Detect) | `slop-prose.md` | `tests/expected/slop-prose.md` |
| `structure-duplicated-actions` | crisp-structure (Audit) | `duplicated-actions.ts` | `tests/expected/duplicated-actions.md` |
| `audit-bad-dashboard` | crisp-audit | `bad-dashboard.md` | `tests/expected/bad-dashboard.md` |
| `review-bad-dashboard` | crisp-review | `bad-dashboard.md` | `tests/expected/bad-dashboard.md` (grade, slop, P0 only - review returns the top 3) |
| `decisions-suppression` | crisp-audit | `bad-dashboard.md` + `decisions/.crisp.md` | `tests/expected/decisions.md` |

Each graded case has a `skill-fired` indicator, `llm` rubrics for the must-find lists (split into chunks of 3 to 5 items so the judge stays stable), `llm` rubrics for the must-not-flag / fabrication checks, and free `regex` graders for binary outputs (pre-flight FAIL lines, `Grade: D`, `Suppressed by decisions: 1`, the Self-audit line, the Evidence line).

Fixtures are copies. Six cases read theirs from a read-only `fixture/` folder (`context.add_dirs`). `decisions-suppression` needs `.crisp.md` at the project root, so its `fixture.sh` scaffold writes both files into the workspace; it only runs with `--scaffold`. If you change a file in `tests/fixtures/`, copy it into the matching `graded/*/fixture/` folder and the heredocs in `graded/decisions-suppression/fixture.sh`.

## Run it

All commands run from the repo root (the folder holding `.claude-plugin/plugin.json`).

```bash
# Whole suite, with the no-plugin baseline (default 3 runs per arm)
claude plugin eval . --scaffold --max-cost-usd 25

# One case, one arm, one run - the cheap way to iterate
claude plugin eval . --case crisp-copy --runs 1 --ablation none

# Only the free-graded triggering cases (no judge calls)
claude plugin eval . --tag triggering --ablation none

# Only the graded fixture cases
claude plugin eval . --tag graded --scaffold

# CI
claude plugin eval . --scaffold --trust-plugin --json results.json \
  --threshold 0.8 --model claude-sonnet-5 --judge-model claude-haiku-4-5 \
  --no-publish --max-cost-usd 25
```

`--case` matches the case name, which is the case's directory name (for example `crisp-copy`, `json-to-yaml`, `audit-bad-dashboard`). The first run in a terminal asks `Trust this plugin directory?`; answer `y`, or pass `--trust-plugin` in CI.

To also check that `decisions-suppression` never writes to `## Decisions`, grant edits for that run: `claude plugin eval . --case decisions-suppression --scaffold --allow-tools Edit Write`. Without the grant the `decisions-log-untouched` and `no-file-edits` graders pass trivially.

## Cost

Every agent run and every `llm` judge vote is a real model call on your account. The full suite is 41 cases x 3 runs x 2 arms = 246 agent runs, plus 3 judge votes per `llm` grader per run (27 `llm` graders across the 7 graded cases). Triggering and negative cases use only free graders, so they cost just their agent runs. Set `--max-cost-usd` as a ceiling, use `--ablation none` to halve the cost when you don't need the delta, and use `--runs 1` while iterating (then confirm at 3 runs). Results land in `evals/results/<timestamp>/` (git-ignored).

## Known gaps

- `crisp` (router) and `crisp-teach` set `disable-model-invocation: true`, so Claude cannot pick them on its own. Their triggering cases are tagged `model-invocation-disabled` and will score 0 until that flag changes. They stay in the suite as a record of the intended trigger phrasing.
- `crisp-study`, `crisp-tune`, `crisp-stress`, and `crisp-variants` are tagged `new-skill` so they can be run on their own while their descriptions settle.
- `crisp-study` and `crisp-variants` need network or write access to do their work. Their triggering grader only checks that the skill was chosen, so no grant is needed.

## Add a case

1. Pick the group: `triggering/`, `negative/`, or `graded/`. Create `evals/<group>/<case-name>/`.
2. Write `prompt.md`. Copy the frontmatter from a sibling case. Phrase the body the way a user would type it and never name the skill. Every key must be a documented field (`name`, `description`, `tags`, `plugins`, `runs`, `expected_outcome`, `model`, `max_turns`, `timeout_seconds`, `allowed_tools`, `append_system_prompt`, `env`); an unknown key fails the case.
3. Add at least one file under `graders/`. A case with no grader fails to load.
   - Skill fired: `type: tool_used`, `tool: Skill`, `input_match: '"skill"\s*:\s*"(?:[\w-]+:)?<skill-name>"'`. This is an indicator only in two-arm runs.
   - Must not fire: the same with `min: 0`, `max: 0`, `arm: both`.
   - Must find / must not flag: `type: llm`, body = concrete PASS and FAIL conditions. Keep each rubric to five items or fewer.
   - Exact output: `type: regex`, `pattern`, `flags: i` (inline `(?i)` is not supported), `match: not_contains` for absence.
4. Fixtures: put files in `<case>/fixture/` and add a `case.yaml` with `schema_version: "1.1"`, `name: <case-name>`, and `context: { add_dirs: [fixture] }`. If the file must sit in the workspace itself, use `context.scaffold_script` instead (runs only with `--scaffold`).
5. Run it alone: `claude plugin eval . --case <case-name> --runs 1 --ablation none`, read the report, then confirm at the default 3 runs.
