## Settled Decisions

Before reporting, read the `## Decisions` section of `.crisp.md` if it exists. Each line is a finding the team already ruled on:

```
- YYYY-MM-DD | <rule, tell, or issue> | <surface path, or "all"> | accepted | <reason>
```

- **Same issue, same surface:** drop the finding. Add `Suppressed by decisions: N` as the last line of the output so nothing disappears silently.
- **The reason no longer holds** (the decision cites Brand register but this surface is Product, or the accepted element now blocks a task): report the finding, cite the decision's date, and state in one line what changed.
- **Never re-raise a settled decision on judgement alone.** New evidence reopens it; a different opinion does not.

When the user rejects a finding in this session with explicit words ("that's intentional", "on-brand", "won't fix", "leave it"), append one line to `## Decisions`, creating the section at the end of `.crisp.md` if it is missing. Get the date from `date +%Y-%m-%d`. Record only what the user said. Never log a decision on your own initiative.
