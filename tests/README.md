# CRISP Skill Evals

Regression fixtures for the CRISP skill pack. Every time a skill is revised, re-run it against these fixtures and compare with the expected findings - if a previously caught violation goes uncaught, the revision regressed the skill.

## How to run

1. Open a fresh agent session with the CRISP skills installed.
2. Invoke the skill against the fixture, e.g.:
   - `/crisp-design-eng` on `fixtures/janky-component.css`
   - `/crisp-copy` (audit mode) on `fixtures/weak-copy.md`
   - `/crisp-review` or `/crisp-audit` on `fixtures/bad-dashboard.md`
3. Compare the output against the matching file in `expected/`.

## Pass criteria

- Every violation listed in the expected file is caught (wording may differ; the violation and its dimension must match).
- No fabricated violations - the skill must not invent issues absent from the fixture.
- Binary checks report as binary (counts, pass/fail), not hedged prose.
- Output format matches the skill's declared format.

| Fixture | Skill(s) | Expected findings |
|---|---|---|
| `fixtures/janky-component.css` | /crisp-design-eng | `expected/janky-component.md` |
| `fixtures/weak-copy.md` | /crisp-copy | `expected/weak-copy.md` |
| `fixtures/bad-dashboard.md` | /crisp-review, /crisp-audit | `expected/bad-dashboard.md` |
