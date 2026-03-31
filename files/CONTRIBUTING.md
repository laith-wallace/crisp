# Contributing to CRISP

There are three ways to contribute, each with a different barrier and review process.

---

## Tier 1 — Benchmark Suggestions (anyone, via Issues)

The easiest contribution. If you've found a product that exemplifies a CRISP dimension particularly well — or if an existing benchmark has declined in quality — open a GitHub Issue with the label `benchmark-suggestion`.

Your issue should include:
- Product name
- Which CRISP dimension it exemplifies (C / R / I / S / P, or a CRISP extension)
- The specific pattern and why it's exemplary (not "their design is good" — "their empty states always name the missing thing and have one recovery CTA")
- A link, screenshot, or description of the pattern

Benchmark suggestions are batched into patch releases of `BENCHMARKS.md`. No code changes required. Turnaround: typically within two weeks.

---

## Tier 2 — New Skill Proposals (community PRs, owner review)

If you want to contribute a new skill, open a PR. The PR must include:

1. **Skill file** at `files/[skill-name].md` following the frontmatter format:
   ```yaml
   ---
   name: [skill-name]
   description: [one-line description — this appears in the installer]
   user-invocable: true
   ---
   ```

2. **CRISP alignment statement** in the PR description: how this skill relates to the core CRISP framework. Which dimensions does it serve? Why can't it be expressed within the existing five skills?

3. **Why it's timeless** — explain why the evaluation criteria will remain valid in 3+ years. Trend-specific skills (e.g. "evaluate this for [specific platform that may not exist in 2028]") are lower priority than structurally durable skills.

4. **Complete skill content** — the PR should include a working skill file, not a draft. Review is easier when the skill is complete enough to install and use.

**Review criteria:** Does it belong in CRISP? Is the content accurate and specific? Does it follow the style and tone of existing skills? Is it timeless or trend-specific?

Accepted PRs are shipped in the next minor release.

**Community skills:** Skills that are accepted but serve a narrower audience (specific industry, specific tool) may be added under `skills/community/` and labeled as community-maintained in the installer.

---

## Tier 3 — Framework Changes (RFC process)

Changes to the five CRISP dimensions, the P0–P3 severity model, the A–F grading scale, or the `.crisp.md` schema are framework changes. They require an RFC (Request for Comment).

To propose a framework change:

1. Open a GitHub Issue with the label `rfc` and the title format: `RFC: [What you're proposing]`
2. Describe:
   - What you're proposing to change
   - Why the current framework is insufficient for this use case
   - What the proposed change looks like in practice (how an audit or output would differ)
   - Who benefits and who is affected
3. The RFC stays open for **14 days** of community comment
4. After 14 days, the owner decides: accept, reject, or revise

Framework changes ship as major releases (e.g. 1.x → 2.0) when they affect the `.crisp.md` format, and as minor releases when they don't.

**Note:** CRISP Extensions (`CRISP + AI`, `CRISP + a11y`, etc.) do not require an RFC — they're additive and don't change the core framework. Propose them as Tier 2 skill PRs.

---

## Style Guide for Skill Files

All CRISP skills follow these conventions:

- **Direct voice.** "Rate each dimension 1–10" not "You should consider rating each dimension."
- **Specific over general.** "Spinner appears on filter changes" not "Loading states could be improved."
- **Every violation has a fix.** Not a direction ("improve the copy") — an action ("Replace 'No data' with 'You haven't added any deals yet. Add your first one →'").
- **P0–P3 severity** on every violation or issue.
- **Timeless criteria first, benchmarks second.** The evaluation rubric should work without the named benchmarks. The benchmarks are examples, not the basis of the criteria.
- **Output formats are templates.** Use code blocks for output structure so users know exactly what to expect.

---

## Questions

Open a GitHub Issue with the label `question`. For anything urgent, reach out via the repository discussions.
