---
name: crisp-evidence
description: Runtime proof that a change works - the agent drives the app live while a recorder captures the session with timestamped setup, test_start, and assertion annotations (passed, failed, untested), then writes report.md and manifest.json for the PR. Headless environments swap the recorder for numbered screenshots; non-UI changes ship measured numbers or output pairs. Use when a change needs verifiable evidence instead of a prose claim, when reproducing a bug before fixing it, or before any PR that says 'tested'. Before/after design deltas belong to /crisp-proof.
user-invocable: true
version: "1.0.0"
metadata:
  author: Laith Wallace - FlowConverts
  adapted-from: michaelshimeles/skills evidence-driven-testing (annotation protocol and guardrails; recorder rewritten as bash)
---

# /crisp-evidence - Tested Means Recorded

"Tested locally" is a claim. A recording of you driving the flow, with each assertion stamped on the frame, is evidence. This skill produces the second thing.

The recording is you testing the app: start the recorder, then click, type, and navigate through each test target yourself. Every action on the video is the test being performed. Scripted playback, stitched clips, or synthetic footage are never evidence.

Load `.crisp.md` if it exists. Its jobs-to-be-done name the flows whose evidence matters most.

## Inputs

| Input | Required | Notes |
|---|---|---|
| Test targets | yes | Behaviours phrased as testable statements: "It should save on blur" |
| PR or issue | no | Where the evidence gets posted. Absent → deliver to the requester only |
| Before state | when fixing a bug | Reproduce and capture the failure **before** the fix - it is the cheapest moment and it is half of the before/after pair |

## The recorder

`$EVIDENCE` below is the path to `scripts/evidence.sh` inside this skill's install folder (for Claude Code: `~/.claude/skills/crisp-evidence/scripts/evidence.sh`). It needs bash, git, and for video, ffmpeg + ffprobe built with libx264 and the subtitles filter. If the script is not present on your platform copy, follow the headless path below with the same annotation protocol kept as a file.

```bash
bash $EVIDENCE doctor
```

Read two lines: `ready` (toolchain present) and `capture_ready` (a screen source works). Sources: macOS `avfoundation` (needs Screen Recording permission for the terminal or agent host), Linux `x11` (needs `DISPLAY`). `capture_ready: no` → use the headless path; do not fake it.

Commands:

```bash
bash $EVIDENCE start .artifacts/evidence/<task> --title "<what is being verified>" --environment "<OS / browser / URL>"
bash $EVIDENCE annotate .artifacts/evidence/<task> --type setup --message "Signed in, on /projects"
bash $EVIDENCE annotate .artifacts/evidence/<task> --type test_start --message "It should save the title on blur"
bash $EVIDENCE annotate .artifacts/evidence/<task> --type assertion --result passed --message "Title persisted after reload"
bash $EVIDENCE stop .artifacts/evidence/<task>
```

`start` records the commit and branch. `stop` ends the capture, burns every annotation into `evidence.mp4` as a subtitle, writes `report.md` and `manifest.json`, and exits non-zero if any assertion failed. Add `.artifacts/` to `.gitignore` - evidence is uploaded, never committed.

## Protocol

### 1. Prepare

- Maximise the browser or app window. Close popups, notifications, and extra panels. Never record a half-covered window.
- Navigate to the starting state before recording, unless setup is itself under test.
- Confirm the server under test is **your** process: `lsof -i :<port>` (or `ss -ltnp "sport = :<port>"`), then `ps -p <pid> -o args=`.
- Fixing a bug? Reproduce it now, with the recorder running, and mark the failing assertion `failed`. Stop, keep that session as `<task>-before`, and start a fresh session after the fix.

### 2. Record and annotate as you test

Binary rules for annotations:

1. One `test_start` per named behaviour, phrased Jest-style: "It should …".
2. One `assertion` per meaningful state change. Consolidate - never one per UI label.
3. Every assertion carries `passed`, `failed`, or `untested`. Zero silent skips; `untested` always states the reason in the message.
4. Messages are 80 characters or fewer. The recorder rejects longer ones.
5. Look at the screen before choosing `passed`. The timestamp records when you asserted, not whether it was true.
6. Work at a watchable pace: let the UI settle after each action so the state change is visible on the frame.
7. A `setup` annotation opens every session and states the starting context.

### 3. Stop and verify the recording

```bash
bash $EVIDENCE stop .artifacts/evidence/<task>
```

`verified: true` means the video probed. Then confirm it shows what you claim: extract a frame at one or two assertion timestamps and look at it.

```bash
ffmpeg -ss <t> -i .artifacts/evidence/<task>/evidence.mp4 -frames:v 1 frame-<t>.png
```

Replace the `TODO` line in the Caveats section of `report.md`. A report with the placeholder still in it is not finished.

### 4. Post

- `report.md` is the report: what was tested, environment and exact commit, pass/fail per test, caveats. Extend it, do not rewrite it.
- Post the video and the summary as a PR comment, or embed in the PR description if it is your PR. `gh pr comment` cannot attach a local video - upload through the PR comment box in an authenticated browser, or to a host and link it. Reopen the comment and confirm the video plays before saying it is posted.
- Attach the same video to the tracker issue with a one-line result.
- Run the PR text through `/crisp-unslop` before posting.

## Guardrails

- Never present scripted playback, stitched clips, or generated footage as a recording.
- Never record a screen showing secrets, tokens, customer data, or payment details. Mark that flow `untested` with the reason.
- When verifying a fix, the report references the before session showing the old failure alongside the new success.
- Always state the exact commit, branch, or deployment tested against - the recorder stamps it, do not override it.
- Evidence complements the repo's checks (typecheck, build, tests). It never replaces them. Run them and cite the command and result in the report.

## No computer-use tools, GUI exists

Drive the app with the harness's browser tools (Claude in Chrome, computer use) or an external actuator such as `cua-driver` (github.com/trycua/cua). It is still you testing live; only the input mechanism differs. Keep the bundled recorder for the video and annotations. If neither works, `cua-driver recording start <dir>` / `stop` or the OS recorder (`screencapture -v out.mov` on macOS) capture the video with no annotation overlay - keep the protocol as `assertions.md` exactly as in the headless path.

## Headless path (no display)

Same assertion discipline, scripted capture:

- Everything goes to `.artifacts/evidence/<task>/`. Keep the capture script beside the captures so the run is repeatable.
- Screenshots: one-off Playwright, no project dependency:

  ```bash
  npx --yes --package=playwright node record.mjs
  ```

  Minimal `record.mjs`:

  ```js
  import { chromium } from "playwright";
  const browser = await chromium.launch();               // add args: ["--no-sandbox"] in containers
  const context = await browser.newContext({ recordVideo: { dir: ".artifacts/evidence/<task>/" } });
  const page = await context.newPage();
  await page.goto("http://localhost:3000/path-under-test");
  await page.screenshot({ path: ".artifacts/evidence/<task>/01-precondition-signed-in.png" });
  // ...one meaningful state change per step, one screenshot each...
  await context.close();                                   // finalises the .webm
  await browser.close();
  ```

- The annotation protocol becomes files: number captures in test order with the assertion in the name (`02-it-saves-on-blur-passed.png`) and keep `assertions.md` listing each `test_start` / `assertion` with its result and reason.
- Run `bash $EVIDENCE start <dir> --source none` and the `annotate` / `stop` commands anyway: you still get `report.md` and `manifest.json` with the commit stamped, and the video line says headless.

## Non-UI changes still need evidence

| Change | Evidence |
|---|---|
| API or performance | A scripted probe with measured numbers - request counts per phase, latency before and after - saved to `probe-output.txt` |
| Rendering, canvas, shader | Rendered frames plus pixel-diff values, saved as PNGs |
| Agent behaviour | The transcript excerpt showing the tool call and the response |
| Bug fix | The reproduction captured before the fix, paired with the capture after |

Hand before/after pairs to `/crisp-proof` for the PR table.

## Output

Print `report.md`, then:

```
## Evidence: [title]

**Result:** [N] passed, [N] failed, [N] untested   **Commit:** `abc1234` on `feature/x`
**Video:** .artifacts/evidence/<task>/evidence.mp4 (verified)  |  headless: [N] captures + assertions.md
**Repo checks:** `npm run build` ok, `npm test` 42 passed
**Posted to:** PR #123 comment (video confirmed playing) / not posted - [reason]

Untested:
- It should show the declined-card error - no test payment token available
```

## Longitudinal tracking

Append one line to `## History` in `.crisp.md` if it exists. Date from `date +%Y-%m-%d`:

```
- [YYYY-MM-DD] | /crisp-evidence | [task] | [N] passed, [N] failed, [N] untested | [video/headless]
```
