## Blind Review

The person who built a change is the worst judge of it, because they know what it was meant to look like. A blind reviewer judges the picture.

1. **Give the reviewer five things only:** the captures, the live URL when one exists, the one-line brief, the closest reference capture (`.crisp.md` `## Benchmarks` `ref:` line, or the Before), and the `/crisp-review` checklist. Never the builder's plan, reasons, fix list, or report.
2. **Use a fresh sub-agent** via the Agent tool when one exists. Without one, say `Blind review: degraded (same context)` in the report. A silent degraded run is not a blind review.
3. **The bar for a finding is a capture.** Every finding names the capture file that shows it. A predicted failure is not a finding, and a predicted pass is not a pass: when a needed capture does not exist (a state, a width, a hover, a mid-transition frame), the reviewer captures it or lists it under `Not checked`.
4. **The reviewer's first question:** put the target beside the reference and say the one biggest difference.
5. **Re-judge what the builder called intentional.** A finding the builder waved off is open until the reviewer looks at the capture and agrees.
6. **The reviewer does not fix.** It returns a ranked list, or `nothing` plus the list of captures it looked at.
