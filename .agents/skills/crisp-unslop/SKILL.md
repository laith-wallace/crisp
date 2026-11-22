---
name: crisp-unslop
description: Edit prose so it reads human and keeps the writer's voice, or detect AI-slop patterns without rewriting - landing page copy, blog posts, docs, release notes, emails, PR bodies. Use when text 'sounds like AI', needs to be sharper or more direct, or before any human-facing text ships. UI strings (labels, errors, CTAs) belong to /crisp-copy.
metadata:
  version: "1.0.1"
  checked: "2026-11-22"
  checked-with: "claude-opus-5-5"
  author: Laith Wallace - FlowConverts
  adapted-from: cursor/plugins pstack unslop (MIT), petergyang/no-ai-slop (MIT)
---

# /crisp-unslop - Human Prose, Writer's Voice

The visual side of the pack has a Slop Check: would someone look at this and say "AI made that"? This is the same check for words. It finds the tells that make prose read machine-made, removes them with the smallest edit that works, and leaves the writer's voice intact. Sterile, voiceless prose is as obvious as slop - flattening a draft into generic polish is a failure, not a fix.

Load `.crisp.md` if it exists. Its **register** sets the tolerance:

| Register | Stance |
|---|---|
| **Brand** | Voice is the product. Keep opinion, humour, rhythm, and odd word choices that belong to the writer. Cut only what reads generic. |
| **Product** | Clarity first. Cut anything that delays the instruction or the fact. Keep voice where it costs the reader nothing. |

If `.crisp.md` is absent, infer the register from the text (a homepage is Brand, a changelog is Product) and declare the inference in one line. Ask only when the surface could be either.

## Scope

In scope: any prose a person will read - landing and marketing copy, blog posts, docs, README and changelog entries, onboarding and lifecycle emails, release notes, commit messages, PR titles and bodies, support replies, the closing message of a task.

Out of scope, route instead:
- UI microcopy (labels, empty states, errors, tooltips, CTAs) → `/crisp-copy`
- Funnel section copy inside a `/crisp-funnel` build → finish the build, then run this skill on the assembled page copy

Apply this skill to text you wrote or changed. Never rewrite prose you were not asked to touch.

## Modes

Infer the mode before asking. Declare it in one line and proceed. Ask **"Edit it, or just flag what's wrong?"** only when the request is genuinely ambiguous.

| Mode | Trigger | Deliverable |
|---|---|---|
| **Edit** (default) | A draft is pasted with "fix", "tighten", "make this sound human", or no instruction at all | The full edited draft plus a **What changed** section |
| **Detect** | "Is this slop?", "audit", "scan", "flag", "does this read as AI?" | A findings table - pattern id, quoted line, fix in under ten words. Zero rewriting. |
| **Write** | "Draft a post about…", "write the release notes" | Write it, then run Detect on your own output and fix every hit before delivering |

If no draft is provided and the mode is Edit or Detect, ask for it. If the audience or destination is unclear and it changes the edit, ask one question: "Who is this for and where will it be published?" Never ask more than one question before starting.

Detect never scores the draft, never estimates a percentage, and never claims AI authorship. Detectors guess. Named patterns with quoted lines are evidence the writer can check.

## Step 0 - Mechanical pre-check

Run before reading for meaning. Counts are evidence; they go in the report.

```bash
# Save the draft to a temp file first, then:
grep -oE "—|–" draft.md | wc -l                                            # dashes
grep -oiE "\b(delve|foster|leverage|utilize|utilise|facilitate|empower|streamline|robust|cutting-edge|paradigm shift|game changer|game-changer|tapestry|realm|beacon|multifaceted|meticulous|intricate|paramount|transformative|elevate|embark|supercharge|harness|ever-evolving|testament|pivotal|landscape|showcase|underscore|garner|vibrant|seamless|crucial|additionally|enduring|interplay)(s|d|ed|es|ing|ly)?\b" draft.md | sort | uniq -c | sort -rn   # banned words
grep -cE "^\*\*[^*]+:\*\* " draft.md                                       # bold-label-colon list lines
grep -cE "^(In conclusion|Ultimately|Overall|To sum up|In summary)\b" draft.md   # recap openers
grep -ciE "\b(not just|isn't just|is not just|(it's not|isn't|is not) [a-z ]+\. it's|the question isn't)\b" draft.md   # binary contrasts
grep -cE "^\s*[^:\n]{3,60}: [a-z]" draft.md                                 # colon-reveal candidates (verify by eye)
grep -ciE "^(#+ )?.*(here's the thing|let me be clear|what nobody tells you|the part everyone misses|plot twist|what if i told you)" draft.md   # rhetorical setups
```

Rule: a non-zero count marks candidates, and every candidate is checked by eye before it becomes a finding, because grep cannot see context. Exclude hits inside code blocks and inline code, and en dashes in number or date ranges (`10–20`, `Mon–Fri`), since those are correct typography. A confirmed candidate is a finding, not a suggestion. The word "seamless" is exempt only when it names the CRISP dimension.

## Step 1 - Read the whole draft, then write the Voice Card

Read every line before editing anything. Then write three lines and keep them visible while you edit:

```
Voice: [vocabulary and register - e.g. blunt, first person, swears once, dry]
Cadence: [sentence shape - e.g. short declaratives with one long run-on per section]
Keep: [2-3 specific lines or traits that must survive untouched]
```

If you cannot name the core point of the draft in one sentence, stop and ask the writer what the reader should think, feel, or do afterwards.

## Step 2 - Scan against the pattern catalogue

The full catalogue with ids, tells, and fixes lives in `references/patterns.md`. Scan all nine families:

| Family | Ids | What it catches |
|---|---|---|
| Content | C1-C6 | Puffery, vague attribution, superficial -ing analysis, formulaic challenges |
| Language | L1-L7 | AI vocabulary, fake-strong verbs, binary contrasts, rule of three, synonym cycling, false ranges |
| Punctuation and style | S1-S6 | Em dashes, colon connectors and colon reveals, bold overuse, title case, curly quotes, decorative emoji |
| Formatting | F1-F3 | Bold-label lists, bullets that should be prose, headers over tiny sections |
| Rhetoric | R1-R6 | Throat-clearing, faux-insight setups, rhetorical questions, negative listing, dramatic fragments, robotic rhythm |
| Endings | E1-E2 | Fake-profound kickers, summary recaps |
| Communication artifacts | A1-A3 | Chatbot phrases, cutoff disclaimers, sycophancy |
| Filler | X1-X4 | Filler phrases, hedging stacks, empty adverbs, interpretive metadiscourse |
| Jargon and plain speech | J1-J5 | Abstract metaphor nouns, says-how-it-feels, dense sentences, passive voice, portability failures |

Every finding cites the line (quote it, or give a line number when the draft is a file). No location = no finding.

## Step 3 - Rewrite with the minimum effective edit

Binary rules. Each one is checkable after the edit:

1. Zero invented claims, numbers, examples, quotes, or opinions. If a weasel attribution has no source, flag it for the writer - never fabricate one.
2. Zero banned words remain (Step 0 list), unless quoted as an example.
3. Dashes: 0 in copy under 300 words; at most 2 in longer drafts, and only where a comma or full stop would read worse. Never swap an em dash for parentheses or a semicolon - that trades one tell for another. Use " - " or end the sentence.
4. Zero bold-label-colon list lines that restate the line. A bold lead-in ending in a full stop, followed by new detail, is allowed.
5. Body headings (H2 and below) in sentence case; an H1 or document title may keep title case. Zero decorative emoji in headings or bullets.
6. Zero recap endings. The draft ends on its last concrete point, takeaway, or next action.
7. Zero fake-profound kickers. Delete; never rewrite into a better metaphor.
8. Every sentence passes the portability test: if it could move unchanged to another product, company, or writer, it is cut or made specific.
9. Active voice wherever the actor is known. "The compiler validates queries", not "queries are validated".
10. The Voice Card's **Keep** lines survive verbatim.

Rules 1 and 10 outrank everything. A draft that passes every other rule but sounds like someone else has failed.

Edit proportionally. A rough draft with a real voice should sound like the same person, minus the tells. Do not make every paragraph equally tidy. Do not reorganise unless the structure is hurting the piece - and if you do, say why in What changed.

## Step 4 - Restore what removal took out

Removing patterns is half the job. Where the draft already carries the material, sharpen it:

- An opinion the writer holds but hedged into mush → state it plainly. Never add an opinion the draft did not hold.
- A vague "significantly faster" where the draft or the user gave a number → use the number.
- Robotic rhythm → vary sentence length. Short. Then one that takes its time.
- "I" is fine. First person is not unprofessional.
- Complexity the writer acknowledged and then smoothed over → put it back. "Impressive but also unsettling" beats "impressive".

## Step 5 - Self-audit against the eval

Run every check in `references/eval.md`. Each is pass or fail. Any fail → fix and re-run. Maximum two loops; if a check still fails on the third read, report it under **Not fixed** with the reason rather than silently shipping it.

## Output - Edit mode

```
## Unslop: [title or first line of draft]

**Register:** [Brand / Product] - [inferred / from .crisp.md]
**Pre-check:** [N] dashes, [N] banned words, [N] bold-label lines, [N] recap openers

[Full edited draft]

**What changed**
- [Pattern id] [what was cut or changed, one line each - max 10 lines, group the rest by family]
- Kept: [the Voice Card's Keep lines, confirmed intact]

**Not fixed** (omit if empty)
- [Check that still fails and why - e.g. "L5 weasel attribution on line 12: no source given, needs the writer"]
```

## Output - Detect mode

```
## Slop scan: [title or first line of draft]

**Pre-check:** [N] dashes, [N] banned words, [N] bold-label lines, [N] recap openers
**Patterns found:** [N] across [N] families

| Id | Line | Fix |
|---|---|---|
| R2 | "What most people get wrong about evals is…" | Cut the setup; state the claim |
| S2 | "The best part: it learns." | Plain sentence: "It learns, which is the best part." |
| E1 | "The future isn't coming. It's already here." | Delete; end on the previous sentence |

Zero findings is a valid result. Say so in one line and stop.

Want it edited? Say so and this becomes the What changed list.
```

## Examples of good vs weak fixes

**Weak:** "This sentence sounds a bit AI-generated." No pattern, no line, no fix.
**Good:** "L3 binary contrast, line 4: 'It's not about speed. It's about trust.' → 'Trust matters more than speed here.'"

**Weak:** Rewriting "honestly, the API is a mess" to "the API has some inconsistencies". The writer's bluntness was the point.
**Good:** Leaving that line alone and cutting the paragraph of throat-clearing before it.

**Weak:** Replacing the fake kicker "Ship it. Then ship it again." with "Iteration is the real product." Same tell, new costume.
**Good:** Deleting the kicker and ending on "We ship on Tuesdays, and the changelog is public."

## Longitudinal tracking

After delivery, append one line to the `## History` section of `.crisp.md` if it exists. Get the date from `date +%Y-%m-%d`, never from memory:

```
- [YYYY-MM-DD] | /crisp-unslop | [Edit/Detect] | [surface or file] | [N] patterns, top family: [family]
```

## Taste rules

<!-- crisp:shared taste -->
**Taste rules.** Each rule is a count, so a check can say pass or fail. Rules 1 to 7 apply when this skill makes or judges a rendered UI (a screen, a page, a component). The copy tells apply to all copy, prose included. Where this skill states a stricter limit for the same pattern, the stricter limit wins. Em dashes follow this skill's own rule where it has one.

1. **One detail only this client has.** Each screen shows at least 1 detail taken from the brief or the product: its units, its terms, its real prices, hours or numbers. A screen that would fit any business in the category fails.
2. **Real material first.** The client's own product, UI, photos and words lead. A stand-in (stock photo, mock data, coined name) is listed in the report as a stand-in. Zero stand-ins are presented as the client's own.
3. **One system.** 1 primary and 1 secondary button style, 1 card style, 1 radius scale, 1 heading scale, 1 link style per surface.
4. **One bold move per screen.** At most 1 element per screen breaks the system (an oversized heading, a full-bleed photo, a colour block). Everything around it stays quiet.
5. **Structure says something true.** Numbers (01, 02) only on steps a user follows in order. A label over a heading only when it adds information the heading does not.
6. **Motion answers the user.** Every button, link and linked card answers hover and press. Zero sections fade in on scroll by default. Anything that moves for more than 5 seconds has a pause control.
7. **Read the taste bank.** When `.crisp/taste-bank/` exists, read it before designing and name the 1 or 2 references this work borrows from, and what it borrows. Never copy a reference's code, copy, images or signature effect.

**Copy tells that current models still write.** These look like good copy, so they pass review. Count them on the whole surface.

| Tell | Limit | Fix |
|---|---|---|
| Invented specifics: room numbers, batch numbers, times, percentages the brief does not give | 0 | Use a fact from the brief, or write a plainer line |
| A strip of 3 or 4 figures over one-word labels | 0, unless every figure is a brief fact (price, hours, count) | Put each figure in the sentence it proves |
| Two-fragment heading, "X. Y." ("Twelve rooms. Three ways to stay.") | 1 | A name with a claim under it, a verb and the thing, or one plain sentence |
| Number-pair heading ("Four projects, four problems") | 0 | Say what the section holds |
| Contrast frames: "not X but Y", "isn't X", "rather than", "instead of", "without the" | 2, all forms counted together | State the positive fact alone |
| Negation runs ("No forms, no waiting") | 1 | Keep it only when each item is a refusal the buyer can check |
| Virtue words about the client: honest, calm, quiet, quietly, genuinely, truly, simply, thoughtful, carefully, intentional | 0 | Show it with a fact or an admission |
| A dry closing quip at the end of a paragraph | 1 | End on information |
| Default cast names: Priya, Okafor, Marcus, Dana, Aisha, Theo, Kestrel, Halcyon, Acme, Northwind, Lumen, Nimbus, Zenith | 0 | Names only from the brief; mock names that fit the place and age |
| The same section shape (label, heading, short lede, 3 cards) used back to back | 2 in a row | Shape each section from the question the reader has there |
| Testimonials or quotes the brief does not give word for word | 0 | Leave them out |
| Unsourced proof figures ("3x faster", "10,000+ teams", "98% happy") | 0 | Only figures from the brief, with their unit, in a sentence |
| The page talks about itself ("Below you'll find", "This section shows") | 0 | Say the thing |

**Over-correction.** Every ban breeds a substitute. Check for the substitute too.

| Rule applied | Habit it breeds | Counter |
|---|---|---|
| No em dashes | Comma splices and nothing but full stops | Rewrite the sentence: split it in two, or join the parts with a plain word ("and", "so", "because") |
| No "not X but Y" | "rather than", "instead of", "without the" | Count them together; state the positive |
| No hype words | Calm words: quietly, steady, honest, practical | A fact in place of the adjective |
| Avoid lists of three | Everything in pairs | List as many items as there are |
| Be specific | Invented numbers and stories | Brief facts, or a plainer line |
| Short sentences | A drumbeat of fragments | Let 1 sentence per section run long |
| End strong | A moral or quip on every paragraph | End on information |
| Vary section length | One huge and one tiny section on every page | Length follows the material |
<!-- /crisp:shared taste -->

## Lessons

<!-- crisp:shared lessons -->
**Lessons log.** The pack learns the user's taste from their corrections.

- **Before you start:** when `.crisp/lessons.md` exists, read it. Apply every line tagged with this skill or with `all`.
- **This file is always writable.** Appending to `.crisp/lessons.md` is allowed in every skill, read-only ones and ones limited to their target's files included. It never counts against a skill's scope, clean-tree or zero-writes rules.
- **When the user corrects or rejects your output:** append 1 line to `.crisp/lessons.md` (create it if needed) in this shape:
  `- YYYY-MM-DD | <skill or all> | <what was wrong> | <the rule that would have prevented it>`
  Write the rule as a count or a yes/no check, so a later run can test it. One correction, one line. Never log praise, and never log a line the user did not cause.
- **Promote:** when the same rule appears 3 times, tell the user it is ready to move into the pack's shared taste rules (`skills/_shared/taste.md` in the CRISP repo).
<!-- /crisp:shared lessons -->

## Next step

End the report with one line, `Next: <command> - <why>`, picked from these by what this run found. It is the report's only next-step line: where the report template above has a **Next:** or `Ready for` line, write this line there instead. Where the report ends with Handover lines, put it directly above them.

- UI strings left: `/crisp-copy`
- Then: `/crisp-review`
