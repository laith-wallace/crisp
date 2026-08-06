---
name: crisp-doctor
description: Reports and repairs drift between a project's CRISP artifacts (.crisp.md, .crisp/config.json) and what the installed crisp version expects. Use when the user asks what's out of date, stale, or needs refreshing, or after upgrading the crisp package.
user-invocable: true
version: "1.0.0"
---

# /crisp-doctor - Artifact Drift Check

This is maintenance, not design. Do not audit or critique anything, do not open files outside the ones this command names, and do not run any other CRISP command as a side effect.

## What this owns, and what it does not

Two kinds of "out of date" travel under one word - keep them apart:

- **Tool version.** The installed `crisp` package is older than the latest published one. This command doesn't check npm for a newer release; if the user asks, tell them to check `npx @laith-wallace/crisp --version` against the npm listing.
- **Artifact drift.** `.crisp.md` or `.crisp/config.json` was written by an older version of this pack, or by hand, and may be missing fields or hold stale references. This is what this command checks.

Nothing here fabricates a schema-migration history for files older than version stamping existed. An unstamped `.crisp.md` is reported as unknown vintage, not silently assumed current or silently assumed broken.

## Step 1: Run the check

```bash
npx @laith-wallace/crisp doctor --json
```

Add `--target <path>` when the user named a specific workspace in a monorepo; without it, the check runs against the current directory.

The output is `{ findings: [...], ruleRegistryAvailable }`. Each finding has `id`, `artifact`, `path`, `severity`, `summary`, `fix`. An empty `findings` array is the good outcome - say so in one line and stop.

## Step 2: Act by severity

The severity says what should happen, not how bad it is:

- **`auto`** - no decision to make. Run `npx @laith-wallace/crisp doctor --fix` once, then report what it changed in one line. Don't ask permission first, and don't ask about it afterward.
- **`mention`** - the user should know, but there's nothing to decide right now. State it in a sentence with its `fix` text.
- **`route`** - needs a specific command, almost always `/crisp-teach`. Name it and the gap it would close. Only run it if the user asks in this turn - `/crisp-teach` is a conversation, not a repair you perform unattended.

Report all three groups in one pass. Findings are not errors; this command does not "fail" on them.

## Step 3: Don't overclaim

A `crisp-md-version-behind` finding means the file predates the installed version - it does not mean the file is wrong. Report the version gap and let `mention`'s fix text stand; don't assert specific fields are missing unless a separate finding names them.

`config-unknown-rule-ids` means an ignore entry's rule id doesn't match anything in the current detector registry - most often a typo, occasionally a renamed or retired rule. Point the user at `npx @laith-wallace/crisp ignores list` and `scripts/detector/rules.mjs` in the crisp package rather than guessing which.

## Opting out

There is no automatic boot-time check yet - `/crisp-doctor` only runs when invoked. If a future version adds one, its guard will live here.
