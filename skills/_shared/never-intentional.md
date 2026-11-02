## Never Intentional

These `crisp render-check` findings are bugs, never style choices: `page-overflow-x`, `overlapping-text`, `text-cut`, `text-spills`. Each one is drawn on a real screen at a real width.

- **Fix the cause, then re-capture.** A finding that is still there after a fix is still open.
- **Clearing a finding by hiding it is a new bug.** `display: none`, `overflow: hidden` added to mask a spill, removing the text, shrinking the type under 12px, or a narrower `--select` all count as hiding.
- **The only other exit is the user.** A finding the user rules on in words goes to `.crisp.md` `## Decisions`. Never write that line on your own initiative.
- **Clean is not good.** `clean` means the layout measured clean. It says nothing about hierarchy, copy, or whether the design works.
