# CRISP design review (GitHub Action)

Runs the CRISP detector on the UI files a pull request changes and keeps **one** sticky comment on the PR with the findings. Every push updates the same comment, so the thread never fills with bot noise.

The default job is deterministic: no model call, no API key, nothing leaves the runner. It needs only the built-in `GITHUB_TOKEN`.

## What it does

1. Lists the PR's changed files through `gh api` and keeps those ending in `.html`, `.htm`, `.css`, `.scss`, `.jsx`, `.tsx`, `.vue`, `.svelte` or `.astro` (removed files are skipped).
2. Runs `crisp detect --json` on them. The command is picked in this order:
   - the `crisp-command` input, if set;
   - `node bin/crisp.mjs` when the workflow runs inside the CRISP repo itself;
   - `npx --no-install crisp` when your repo has `@laith-wallace/crisp` installed (run `npm ci` first to use your pinned version);
   - the copy of the CLI bundled with the action, which needs no install because the detector uses only Node built-ins.
3. Posts or updates one comment, found by the hidden marker `<!-- crisp-design-review -->`, with a table of rule, `file:line` (linked to the PR's head commit) and severity. The same table goes to the job summary.

The detector honours your `.crisp/config.json` ignores and `crisp-disable-line` comments, exactly as it does locally.

## Use it

Copy [`../../workflows/crisp-design-review.example.yml`](../../workflows/crisp-design-review.example.yml) into your repo as `.github/workflows/crisp-design-review.yml` and delete the `github.repository != 'laith-wallace/crisp'` guards. The minimum is:

```yaml
on: pull_request
permissions:
  contents: read
  pull-requests: write
jobs:
  design-detector:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - uses: laith-wallace/crisp/.github/actions/crisp-design-review@main # pin to a release tag
```

## Inputs

| Input | Default | What it does |
|---|---|---|
| `github-token` | `github.token` | Reads PR files, writes the comment |
| `crisp-command` | auto | Override the CLI command, for example `npx --no-install crisp` |
| `fail-on` | `none` | `P0`, `P1`, `P2` or `P3` fails the step when a finding at that severity or worse exists |
| `max-rows` | `50` | Most findings listed in the comment |

Outputs: `changed-count`, `findings`.

## Fork pull requests

On `pull_request` from a fork, GitHub gives the token read-only access, so the comment cannot be written. The step logs a warning and the findings stay in the job summary. Do not switch to `pull_request_target` to get around this: that runs with write access on code you have not reviewed.

## Optional: AI review with /crisp-review (off by default)

The example workflow has a second job, `ai-review`, that installs Claude Code and the CRISP skills on the runner, runs `/crisp-review` on up to 20 changed UI files, and keeps its own sticky comment (`<!-- crisp-ai-review -->`). It costs model calls, so it only runs when both are true:

- a repository secret `ANTHROPIC_API_KEY` exists, and
- a repository variable `CRISP_AI_REVIEW` is set to `true`.

The job is limited to read-only tools (`Read`, `Glob`, `Grep`, `Skill`), so it cannot edit your code. Fork PRs never receive secrets, so the job skips itself there.

## Local check

The script that does the work is plain Node and can be run by hand inside any PR checkout:

```bash
export GH_TOKEN=... GITHUB_REPOSITORY=owner/repo PR_NUMBER=123
node .github/actions/crisp-design-review/review.mjs changed /tmp/changed.txt
node .github/actions/crisp-design-review/review.mjs detect /tmp/changed.txt /tmp/detect.json
```

`tests/unit/design-review-action.test.mjs` checks that the YAML is well formed and that the comment body is built correctly.
