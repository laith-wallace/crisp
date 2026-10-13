# CRISP skills: improvements for current Claude models

Source: "The Complete Guide to Building Skills for Claude" (Anthropic, 33 pp.), checked against all 29 skills in `skills/`. Line numbers point to `skills/<name>/SKILL.md` unless a file is named.

## Baseline: what already passes

- Folder and `name` in kebab-case and matching, `SKILL.md` spelled exactly, no README inside skill folders.
- Every description under 1,024 characters, no `<` or `>` in frontmatter.
- Every SKILL.md under 5,000 words (largest: crisp-audit at 3,504).
- `references/` and `scripts/` already in use, shared rules transcluded by `sync.mjs`.
- Triggering, negative and graded evals already exist.

The work left is in the bodies, the boundaries between sibling skills, and the evals.

---

## Part 1. Pack-wide changes (one pattern, many skills)

### 1.1 Add "not for" boundaries to descriptions

The guide's fix for over-triggering is a negative trigger: "Do NOT use for X (use Y instead)". Only 4 of 29 descriptions name a sibling (stress, study, tune, variants). Current models route on description text closely, so near-identical trigger phrases cause wrong picks.

Sibling clusters that need a deciding factor in each description:

| Cluster | Deciding factor to state |
|---|---|
| review / audit / ux-laws | 30-second grade vs scored /50 audit vs naming the law behind a finding |
| improve-ui / tune / redesign / loop / design-eng | read-only plans vs tone change vs identity change vs fix loop vs motion craft |
| proof / evidence / production-ready | before/after visuals vs runtime proof of one change vs whole-product launch audit |
| brief / research / feature-design / handoff | scope the problem vs find patterns vs design the flow vs spec for engineers |
| copy / unslop / funnel | UI strings vs long-form prose vs landing page copy |
| a11y / stress | WCAG conformance vs worst-case data |
| study / teach / research | extract tokens from a reference vs interview for product context vs competitor patterns |

Narrow these over-broad triggers:

- crisp-isolate :3 "Use at the start of any feature, fix, or task" fires on every coding request. Limit to parallel or multi-agent work, or an explicit worktree/branch request.
- crisp-unslop :3 "before any human-facing text ships" fires on every PR body.
- crisp-doctor :3 "out of date, stale" collides with dependency questions and crisp-agents-md. Tie it to `.crisp.md` and `.crisp/config.json`.
- crisp-structure :3 "where should this go" fires on trivial file placement. Use "where should this logic live, action or service".
- feature-design "spec the screens for X" collides with handoff "spec this for engineering". Use "map the flow for X".
- crisp-variants :3 is about 130 words of implementation detail. Trim to what, when, and siblings.

### 1.2 Give every absolute a reason and an exit

Newer models follow instructions literally. A rule stated as "never", "zero" or "every" with no reason gets applied where it does harm. The fix is one clause of "why" plus the case where it does not apply. This replaces the guide's older advice to add `CRITICAL:` headers, which on current models tends to cause over-application.

Examples to fix:

- crisp-production-ready :30 "A short list means you didn't look hard enough. Real products carry hundreds." Pushes padding on small repos.
- crisp-design-eng :165 `scale(0.97)` on "every interactive element" (hits text inputs, links, checkboxes). :196 body ≥16px (dense tables). :83 never animate keyboard actions.
- crisp-tune :62 one accent per viewport, :65 CTA ≥7:1 (may be unreachable with brand colours), :188 zero em dashes.
- crisp-structure :83 "zero components that fetch" misfires on React Server Components. :73 forces a Result type on exception-based codebases.
- crisp-improve-ui :23-34 "violating any one invalidates the run".
- crisp-research :208 "Do not deviate", :289 "No icons" (its own template uses →).
- crisp-isolate :42 "any overlap → stop" fires on lockfiles and package.json.
- feature-design :80 "Add keyboard shortcuts" gets applied to a CSV upload.
- crisp-study :63 ≤12 colours misfires on data-viz palettes.
- crisp-ai :69 paragraph-unit streaming as an absolute (buffering adds latency).

### 1.3 Cut textbook knowledge, keep house rules

Current models know WCAG, Fitts, Hick, Miller and Schwartz. Restating them costs context and adds nothing. Keep only your thresholds, mappings to CRISP and audit questions.

| Skill | Section | Saving |
|---|---|---|
| crisp-ux-laws | :16-191 law definitions | about 1,800 → 400 words |
| crisp-a11y | :57-179 criterion definitions, :263-300 repeated as checklist | about 1,100 words; move checklist template to `assets/` |
| crisp-audit | :206-240 emotional journey and benchmark descriptions | about 350 words; move journey to `references/flow-checks.md`, keep benchmark names only |
| crisp-research | :76-151 source tables and URLs, :300-328 footer | about 780 words to `references/sources.md` |
| crisp-improve-ui | :163-185 inlined slop table | about 300 words; load at Step 6 only |
| crisp-funnel | :124-146 slop block, :49-55 Schwartz stages | about 460 words; move to `references/build-mode.md` |
| feature-design | :53-80 generic UX rules | about 150 words; keep the five test questions |

### 1.4 Turn prose checks into scripts

The guide: "Code is deterministic; language interpretation isn't." Several skills describe greps or counts the model has to retype each run, and some are already wrong.

- crisp-structure :48 `grep -l ... | uniq -c` counts each file once, so every count is 1. The duplication evidence is meaningless. Ship `scripts/find-mechanics.sh`.
- crisp-agents-md :33-53 and :120-127, about 50 lines of bash writing to `/tmp`. Ship `scripts/discover.sh` and `scripts/verify.sh` using `mktemp`.
- crisp-unslop :51-59 grep list has drifted from the L1 list in `references/patterns.md:33` ("seamless" in one, not the other). One `scripts/precheck.sh` reading one word list.
- crisp-redesign :43-45 SEO, analytics IDs and URLs checked by eye. Script a before/after snapshot of routes, title/meta, anchor IDs, form names and tracked labels.
- crisp-tune :61-87 counts (shadows, font sizes, weights, off-token values) done by hand. Add `crisp detect --metrics`.
- crisp-stress `:92` and `references/injection.md:60+` measurement snippets. Ship `scripts/measure.js` returning JSON.
- crisp-a11y, crisp-design-eng, crisp-copy duplicate rules `crisp detect` already has (missing alt text, low contrast, clickable div, outline none, em dashes, off-token colour and radius, transition-all) but never call it. Run `crisp detect --json` first, as crisp-review :46 does.
- crisp-tune :94, :100 call `detect` without `--json`. Standardise.

### 1.5 Remove stale harness and dated references

- crisp-audit :21-22, :284 "Agent tool" and "Task tool" in adjacent lines. Use one generic term: "a sub-agent tool, if available".
- crisp-evidence :28 hard-codes `~/.claude/skills/crisp-evidence/`, wrong for plugin installs. Use "this skill's directory". :30 suggests `sudo apt-get`; ask first.
- crisp-proof :107, crisp-study `references/capture.md:14` name Claude in Chrome, computer use, Playwright MCP. Describe the capability: "any tool that can drive a browser".
- crisp-production-ready :72 "If you run out of context". Harnesses now compact rather than truncate, so the model cannot detect this. Use a pass or time budget.
- crisp-isolate :18 assumes Claude Code always creates worktrees. Detect it with `git rev-parse --git-common-dir` vs `--git-dir`. :28, :60 hard-code `main`; use `origin/HEAD`.
- crisp-agents-md :40 reads `.cursor/rules/*.md`, which `sync.mjs:48` now deletes. Misses `.cursor/skills`, `.gemini/skills` and plugin-namespaced names (`/crisp:crisp-isolate`), so the phantom-skill check gives false failures.
- crisp-doctor :16, :24 `npx @laith-wallace/crisp` fetches latest, not the installed version. Use `npx --no-install`.
- crisp-research :155 assumes Mobbin only via web search. A Mobbin MCP exists; prefer it when connected. :84 "Flooded by 2025".
- crisp-ai :10 "didn't exist before 2023", :20-24 product examples (Galileo AI, Uizard, Devin). Describe patterns, or move dated examples to a reference file.
- crisp-variants `references/switcher.md:44-57` Svelte 4 idioms. Add a Svelte 5 runes pattern.
- crisp-design-eng :220 and `references/performance.md:27` "Framer Motion". Now "Motion".
- crisp-ux-laws :68 Miller 7±2. Current research puts working memory near 4 chunks.
- crisp-a11y :84 APCA as "design truth". It is a draft. Report WCAG 2 ratios, APCA as advisory.

### 1.6 Shared-block fixes

- Slop rule (`_shared/slop-tells.md`): "one tell = Fail" misfires in tune, variants and redesign when a project's own DESIGN.md mandates the pattern (Inter, card grid). Add: "a pattern documented in DESIGN.md or `.crisp.md` tokens is not a tell".
- History writes: review, audit, loop, proof, tune and variants all append History lines. Loop calls review up to 5 times, proof calls it twice, so nested runs multiply entries. Add a `history.md` shared block that writes only at the top level.
- Output templates: the evidence-gate and decisions blocks add `Unverified` and `Suppressed by decisions: N` outputs, but no skill's output template has a slot for them. Add the slots.
- crisp-stress :69-76 inlines the shared severity block, then overrides it at :78-85. Drop the shared block.
- crisp-a11y :22-24 duplicates the inlined evidence gate. :196-203 hand-rolls a severity table. Use the shared ones.
- crisp-copy, crisp-ux-laws, crisp-ai have no decisions or severity blocks, so they re-raise intentional choices and use P0-P3 without defining it.
- crisp-structure :153 defines a P0-P3 scale that conflicts with `_shared/severity.md`. Rename (S0-S3) or label it a code-severity scale.

### 1.7 Handle missing input and no user

Current models run more often headless (agents, CI, evals capped at 8 turns). Skills that interview the user one question at a time stall there.

- crisp-brief :17, :27-32 up to 7 turns of questions. Skip questions the request already answers. If no reply is possible, write a draft with gaps under Open Questions.
- crisp-teach :21 six sections, about 17 questions. Batch confirmed sections, write partial files with `TODO` markers. :107, :109 "Press Enter" assumes a CLI form.
- feature-design :34 blocks on confirmation. If no reply, pick one direction and record it.
- handoff: never defines its input (feature-design output, Figma URL, screenshot, code). Add an input step; with Figma, use the Figma MCP.
- crisp-stress: browser-only cases (S9, S11-S13) have no fallback. Add `NO BROWSER`, mark those cases untested.
- crisp-ai, crisp-redesign: no rule for description-only or screenshot-only input. Cap confidence and record unknowns.
- crisp-doctor: no handling for npx failing, offline, or non-JSON output.
- crisp-production-ready :35: gates that cannot run in a sandbox become false CRITICALs. Report `UNRUN (env)`.
- crisp-funnel build-mode :114 "current Awwwards SOTD" needs web access. Add a fallback.

---

## Part 2. Bugs and contradictions (fix first)

Items marked ✓ I checked against the code myself.

| Skill | Location | Problem | Fix |
|---|---|---|---|
| crisp-structure ✓ | :48 | `grep -l` + `uniq -c` makes every count 1 | Drop `-l`, count per identifier, or script it |
| crisp-copy ✓ | :67 | "Strong" example is "Something went wrong - try again", which :51 says "always fails" | Use a specific failure: "Deploy failed: build exceeded 10 min. View logs" |
| crisp-tune ✓ | :142 vs :81-87 | Rule 8 bans copy changes; "simpler" moves 1, 3, 7 delete copy | Exempt simpler mode |
| crisp-design-eng ✓ | :319 | "N/10 pass", but there are 11 checks | N/11 |
| crisp-a11y ✓ | :3 | "five new 2.2 criteria"; body marks six | "six A/AA criteria new in 2.2" |
| crisp-teach ✓ | :4 vs :3 | `disable-model-invocation: true` but description carries auto-trigger phrases; other skills route users to it | Enable invocation, or strip the triggers |
| crisp-a11y | :86-87, :109 | 200% zoom without horizontal scroll is 1.4.10, not 1.4.4. 1.4.10, 1.4.12, 2.4.1, 3.1.1 missing. "Left to right" wrong for RTL | Correct the mapping, "logical order for the locale" |
| crisp-unslop | `references/eval.md:5` | Points to Final read items 4-5; they are 24-25 | Fix numbering |
| crisp-unslop | :62 vs :58 | "Non-zero count is a finding" vs "verify by eye". En-dash count hits number ranges | Counts are candidates; exclude code and ranges |
| crisp-design-eng | :152, :155, :273 | Modals 200-500ms vs "under 300ms" vs 300ms ceiling | One rule with the modal exception |
| crisp-ux-laws | :34 vs :197, :113, :131 | Fitts mapped to S then R. "Every R violation is a Doherty violation". Hue-only distinction breaks WCAG 1.4.1 | Reconcile, drop overclaim, "hue plus icon or text" |
| crisp-redesign | :20 vs :82 | Rebrand is Overhaul in one place, hand-off in another | Pick one |
| crisp-redesign | :107 | "Must improve the grade" misfires when baseline is already A | "Grade does not drop and the brief's goals are met" |
| crisp-loop / crisp-proof | loop :112, proof :20-21 | Loop hands off a commit hash; proof forbids checkout and needs a Before URL | Allow `git worktree add <start>` on a second port |
| crisp-evidence | :57 | Bug-repro "before" session ends with a failed assertion, so `stop` exits 3 ✓ (evidence.sh:207). Agent reads it as an error | State that exit 3 is expected there |
| crisp-evidence | :100-102, :128-130 | Heading "No computer-use tools", body says use computer use. `start --source none` after capture, so timestamps are wrong | Fix heading, move `start` before capture |
| crisp-improve-ui | :25 vs :137, :193 | "Edit only under design-plans/" vs decisions and History writing `.crisp.md` | Add the exception |
| feature-design / handoff | fd :65 vs handoff :130 | "No spinners for user actions" vs "spinner beside the label on submit" | "No spinner-only replacements" |
| handoff | :226, :232 vs :245 | "No TBD", "every string is production copy" pushes invented copy; :245 says the opposite | Lead with :245: unknown copy goes in Open Questions |
| crisp-audit | :85-122 vs :193-204 | Step 1 asks for a gut grade before scoring; Step 2 uses severities defined in Step 3 | Drop Step 1 grade, move Severity before Scoring |
| crisp-audit | :98 | Claims /50 mapping is shared with review; review has no /50 | Delete the claim |
| crisp-review | :16 vs :144-170 | Requires file:line per issue, template has no slot | Add `Where: file:line` |
| crisp-tune | :36-39 | Product bolder reaches VARIANCE 5 but range is 1-6; Brand has no DENSITY cap | One table |
| crisp-redesign / crisp-tune | redesign :48-52 | Dials Low/Med/High in redesign, 1-10 in tune | One scale |
| crisp-study | :43 | "Hex or OKLCH" vs design-eng's OKLCH-only rule | Pick one |
| crisp-stress | :137 | Sample fix `white-space: nowrap` causes the overflow S5 and S13 test for | Change the example |
| crisp-teach | :127 | Re-run rewrites `.crisp.md` and drops History and Decisions | Merge, preserve both verbatim |
| crisp-brief | :78 | Overwrites existing `.brief.md` silently | Ask, or write `.brief-<slug>.md` |
| crisp-brief | :90-92, :106-107 | Bad/good example lines inside the output template get copied into the file | Move outside the code fence |
| crisp-research | :16-27 | Never reads `.brief.md`, though its description says "use when a brief exists" | Read it first |
| crisp-agents-md | `references/template.md:10` | "Five beats", lists six | Fix |
| crisp-doctor | :35 | `--fix` runs without the `--target` from :27 | Pass the target |
| crisp-variants | :9-12, :73 | Pick phase assumes same session. Cleanup grep `variant-[b-e]` can hit unrelated names | Write `.crisp/variants.json`; match only the marker |
| crisp-copy | :146 vs :29 | Always asks "What component?" despite infer-first rule | Ask only when unnamed |
| crisp-unslop | `references/patterns.md:57` | Curly → straight quotes conflicts with crisp-copy's typographic rule | Flag mixed styles only |
| crisp-funnel | root | `crisp-funnel-kit.html` (37 KB) at skill root | Move to `assets/`, load named sections only |
| crisp-funnel | :116-122 vs :171 | Quality gate omits the /crisp-review step :171 requires | List it first |

---

## Part 3. Router (`crisp`)

- :15-52 lists skills with no way to separate confusable ones. Add an "If they said X, pick Y" table built from the clusters in 1.1.
- :28-31 puts evidence under Prove, proof under Ship, loop under Ship. Group proof and evidence under Prove; put loop next to Check.
- :63-65 hook and npx details are reference material. Cut to one line.
- `disable-model-invocation: true` is right here. The model already sees every description.

---

## Part 4. Evals (guide chapter 3)

The guide's targets: trigger on about 90% of 10-20 relevant queries, include paraphrases, include should-NOT-trigger cases, and compare against a no-skill baseline.

1. **Positives:** 1 case per skill today. Add 3-5 paraphrased cases per skill.
2. **Near-miss negatives:** the 5 negatives are generic coding tasks and never test sibling confusion. Add:
   - "spec this modal for engineering" must not fire feature-design
   - "research competitors' onboarding" must not fire crisp-brief
   - "prove this fix works" fires crisp-evidence, not production-ready
   - "rename this variable" in a multi-agent repo must not fire crisp-isolate
   - "are my npm deps out of date" must not fire crisp-doctor
   - "make the hero bolder" fires crisp-tune, not crisp-redesign
   - "fix this error message" fires crisp-copy, not crisp-unslop
   - "grade this screen" fires crisp-review, not crisp-audit
3. **Leaked wording:** the crisp-doctor prompt names `.crisp.md`, the handoff prompt repeats its description. Rephrase so they test routing, not string matching.
4. **Functional cases:** only 7 graded cases. Brief, research, feature-design, handoff, isolate, agents-md, doctor, production-ready, a11y, ai, tune, stress, variants have none. Start with cheap regex graders (AGENTS.md has 0 phantom skills; doctor on a stale `.crisp.md` fixture).
5. **CI gate:** gate on the with-skill vs baseline delta, not only the absolute threshold.
6. **Model IDs:** `evals/README.md:48` uses `--model claude-sonnet-5 --judge-model claude-haiku-4-5`. Update to current IDs (Sonnet 5.5, Haiku 5.5 as judge) and recheck the "v2.1.269" minimum at :3.
7. Use the guide's debug question on each skill: "When would you use the crisp-X skill?" If Claude's answer overlaps a sibling, the description needs a boundary.

---

## Part 5. Frontmatter (guide reference B)

- `license: MIT` on every skill (it is in `plugin.json`, in no SKILL.md).
- `metadata.author` on all 29 (currently partial).
- `compatibility` where there are environment needs: crisp-isolate (git, gh), crisp-doctor (node, npx), crisp-agents-md (node, bash), crisp-evidence (recorder or headless browser), crisp-production-ready (writes HTML), crisp-study and crisp-variants (network or write access).
- `allowed-tools` where scope is narrow: crisp-doctor (Bash), crisp-research (search plus Write), crisp-improve-ui (read-only plus Write to `design-plans/`).
- Extend `sync.mjs --check` to lint for `license`, `metadata.author` and a "not for" or "belongs to" clause in each description.

---

## Part 6. Your setup (guide: large context issues)

- The guide flags trouble above 20-50 enabled skills. This session loads well over 100. Many entries in the skill listing have lost their descriptions, so Claude cannot route to them at all.
- The CRISP skills load twice: from this repo and as `anthropic-skills:crisp-*` uploads (a11y, ai, audit, brief, design-eng, research, review, teach, feature-design, handoff). The uploaded copies are likely older versions and compete with the repo versions. Remove the uploads, or keep one source.
- Consider packs: enable the SEO set only in SEO work, CRISP only in product repos.

---

## Guide advice to skip on current models

- **`## Critical` headers and `CRITICAL:` prefixes.** Current models already follow instructions closely. Shouting causes over-application. Use a reason instead (1.2).
- **"Take your time / do not skip steps" for laziness.** The guide itself says this works better in the user prompt than in SKILL.md. Current models do not need it, and it inflates run length.

## Suggested order

1. Part 2 bugs (one PR, small diffs, high confidence).
2. 1.1 descriptions and Part 4 near-miss negatives together, so the eval proves the routing change.
3. 1.4 scripts and 1.6 shared blocks.
4. 1.2, 1.3, 1.5, 1.7 skill by skill, bumping `metadata.version` each time.
5. Part 5 frontmatter and the `sync.mjs` lint.
