## Evidence Gate

Every finding passes this gate before it reaches the output. A finding you cannot evidence is a guess, and guesses erode trust in the real findings.

1. **Quote the evidence.** Live code: `file:line` plus the verbatim line. Screenshot or Figma: name the element and where it sits. Written description: quote the sentence that shows the problem.
2. **Name the broken principle.** The CRISP dimension, WCAG criterion, UX law, or `.crisp.md` Named Rule the evidence violates. "Feels off" is not a finding. Taste is debuggable: trace it to a principle or drop it.
3. **Score confidence 1-10.** No quoted evidence caps the score at 4.

| Confidence | Meaning | What happens |
|---|---|---|
| 8-10 | Evidence quoted, principle named, problem confirmed | Report normally |
| 5-7 | Evidence quoted, but impact depends on context you lack (traffic, user type, intent) | Report with `(verify: <the one thing to check>)` after the fix |
| 1-4 | No evidence, or speculation | Leave out of the main output. List under `Unverified` at the end only when it would be a P0 if true |

Severity and confidence are separate. A P0 at confidence 5 is still a P0; the `verify` note tells the reader what would confirm it. Scores stay internal unless the output format shows them. Their effect is which findings appear and how.
