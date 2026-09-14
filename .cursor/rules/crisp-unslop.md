---
name: crisp-unslop
description: Edit prose so it reads human and keeps the writer's voice, or detect AI-slop patterns without rewriting - landing page copy, blog posts, docs, release notes, emails, PR bodies. Use when text 'sounds like AI', needs to be sharper or more direct, or before any human-facing text ships. UI strings (labels, errors, CTAs) belong to /crisp-copy.
user-invocable: true
version: "1.0.0"
metadata:
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

Rule: a non-zero count on any of these lines is a finding, not a suggestion. The word "seamless" is exempt only when it names the CRISP dimension.

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


---

<!-- references/eval.md -->

# Eval - /crisp-unslop self-audit

Run after every Edit. Answer each check pass or fail. Any fail → fix the draft and re-run. Two loops maximum; a third failure goes in the report under **Not fixed** with the reason.

For Detect, run only the Final read section, items 4 and 5.

## Voice and meaning

1. The edit adds zero claims, examples, numbers, quotes, or opinions the draft did not hold.
2. Every line in the Voice Card's **Keep** list is present verbatim.
3. The writer's vocabulary, cadence, bluntness, humour, uncertainty, and digressions are still recognisable.
4. Strong human sentences were left alone - not rewritten for consistency or tidiness.
5. The amount of cutting is proportional to the slop found. No compression that strips character.
6. The draft leads with what the reader needs, while personal setup that adds context, tension, or character stays.
7. Structure is preserved unless it was hurting the piece - and any reorganisation is explained in What changed.

## Mechanical

8. Banned-word grep (Step 0 list) returns zero hits, excluding quoted examples.
9. Dash count is 0 for copy under 300 words, at most 2 otherwise, and none were replaced with parentheses, en dashes, or semicolons.
10. Zero bold-label-colon list lines that restate their line.
11. Body headings (H2 and below) are sentence case; an H1 title may keep title case. Zero decorative emoji in headings or bullets.
12. Colons are followed by sentence case unless grammar, a proper noun, a title, or code requires otherwise.

## Patterns

13. Zero remaining C1-C6 content tells (puffery, promotional adjectives, -ing analysis, weasel attribution, name-dropping, formulaic challenges), or each remaining one is flagged for the writer because it needs a source.
14. Zero remaining L2-L7 language tells (fake-strong verbs, binary contrasts, rule of three, synonym cycling, false ranges, weak verb phrases).
15. Zero remaining R1-R6 rhetoric tells (throat-clearing, faux-insight setups, rhetorical setups, negative listing, dramatic fragments, robotic rhythm).
16. The ending is the last concrete point, takeaway, or next action - zero E1 kickers, zero E2 recaps.
17. Zero A1-A3 communication artifacts.
18. Zero X1 filler phrases and X2 hedging stacks; X3 adverbs and X4 metadiscourse remain only where they carry emphasis or the writer's voice.
19. Zero J1 abstract metaphor nouns and J2 feel-not-do sentences; J3 dense sentences are split; J4 passives with a known actor are active.
20. Every sentence passes the J5 portability test.

## Final read

21. Read aloud, the draft would sound natural to a sharp colleague.
22. The writer would recognise it as their own.
23. Sentence shapes vary; no stacked fragments, no identical paragraph structures.
24. Edit output includes the full edited draft, a What changed section, and a Not fixed section when anything remains.
25. Detect output names each pattern with an id, a quoted line, and a fix under ten words - and contains zero rewriting, zero scoring, and zero claims about who wrote it.


---

<!-- references/patterns.md -->

# Pattern catalogue - /crisp-unslop

Every pattern has an id, the tell, and the fix. Findings cite the id and quote the line. The catalogue merges two public MIT sources (cursor/plugins pstack `unslop`, petergyang `no-ai-slop`) and dedupes them into nine families.

## C - Content

**C1 Puffery.** "pivotal moment", "testament to", "evolving landscape", "setting the stage for", "indelible mark", "deeply rooted", "plays a vital role", "solidifies its position". Fix: state what happened and let the reader judge whether it matters. "The launch marks a pivotal moment" → "The launch is the company's first paid product."

**C2 Promotional adjectives.** "nestled", "vibrant", "breathtaking", "groundbreaking", "renowned", "stunning", "must-visit", "world-class". Fix: neutral description or a fact.

**C3 Superficial -ing analysis.** Trailing clauses that pretend to explain: "highlighting…", "underscoring…", "reflecting…", "showcasing…", "fostering…", "ensuring…". Fix: delete, or replace with the concrete consequence. "adds file search, highlighting the team's commitment to better workflows" → "adds file search, so users can find old drafts without leaving the editor."

**C4 Weasel attribution.** "Experts believe", "industry reports suggest", "some critics argue", "studies show", "widely regarded as". Fix: name the source or cut the claim. If the writer has no source, flag it - never invent one.

**C5 Name-dropping.** Listing outlets, companies, or people without saying what any of them said. Fix: pick one and quote or paraphrase it.

**C6 Formulaic challenges.** "Despite challenges… continues to thrive." Fix: the specific challenge and the specific outcome, or cut.

## L - Language

**L1 AI vocabulary.** delve, foster, leverage, utilize, facilitate, empower, streamline, robust, cutting-edge, paradigm shift, game changer, tapestry, realm, beacon, multifaceted, meticulous, intricate, paramount, transformative, elevate, embark, supercharge, harness, ever-evolving, testament, pivotal, landscape (abstract), showcase, underscore, garner, vibrant, crucial, additionally, enduring, interplay. Fix: the plain word. "utilize" → "use", "facilitate" → "help", "numerous" → "many", "in the event that" → "if".

**L2 Fake-strong verbs.** "serves as", "stands as", "boasts", "features", "acts as a hub for". Fix: "is" or "has", then the concrete list. "serves as a centralized hub for sponsor management" → "tracks sponsors, drafts, due dates, and approvals in one place."

**L3 Binary contrasts.** "It's not X. It's Y." / "The question isn't X, it's Y." / "Not just X, but Y." Fix: state Y directly. "The question isn't the model. It's the eval." → "The eval matters more than the model."

**L4 Rule of three.** Ideas forced into groups of three for rhythm. Fix: the natural number.

**L5 Synonym cycling.** Agent, assistant, tool, system in one paragraph for the same thing. Fix: pick the clear word and repeat it.

**L6 False ranges.** "from X to Y" where X and Y are not on a scale. Fix: list the items.

**L7 Weak verb phrases.** "made a decision" → "decided". "has the ability to" → "can". "runs quickly" → "is fast" or the number. An adverb propping up a weak verb means the verb is wrong.

## S - Punctuation and style

**S1 Em dashes.** Used as a default rhythm crutch. Fix: 0 in short copy, at most 2 in long drafts. Replace with a full stop, a comma, or " - ". Never with parentheses, en dashes, or semicolons - those trade one tell for another.

**S2 Colon reveals and colon connectors.** A noun phrase, a colon, then a lowercase dramatic reveal: "The best part: it learns." Or a colon as a mid-sentence connector where nothing is being introduced. Fix: colons before lists, labels, examples, and quotes only. Rewrite reveals as plain sentences. Sentence case after a colon unless grammar, a proper noun, a title, or code requires otherwise.

**S3 Bold overuse.** Every proper noun, acronym, or "key phrase" bolded mid-sentence. Fix: bold nothing mid-sentence unless the reader is scanning for it.

**S4 Title case headings.** Body headings (H2 and below) in title case. Fix: sentence case. A document's H1 or title may keep title case - never flag it.

**S5 Curly quotes.** Fix: straight quotes.

**S6 Decorative emoji.** In headings or at the start of bullets. Fix: remove.

## F - Formatting

**F1 Bold-label lists.** A bold label and colon that restates the line: "**Performance:** Performance improved…". Fix: prose. A bold lead-in that ends in a full stop, names the item, and is followed by new detail ("**Schema in TypeScript.** Tables live in one file.") is fine.

**F2 Bullets that should be prose.** Two or three related sentences broken into bullets for the look of structure. Fix: write the sentences.

**F3 Headers over tiny sections.** A header above one or two sentences. Fix: merge into the surrounding prose.

## R - Rhetoric

**R1 Throat-clearing openers.** "Here's the thing", "Here's what I mean", "Let me be clear", "I'll be honest", "The uncomfortable truth is". Fix: cut; state the point.

**R2 Faux-insight setups.** "This is the part most people skip", "What most people get wrong", "What nobody tells you", "The part everyone misses". These flatter the writer as the lone expert. Fix: cut the setup; let the claim stand. "The part everyone misses: distribution is the real moat" → "Distribution is the moat."

**R3 Rhetorical setups.** "What if I told you…", "Think about it:", "Plot twist:", self-answered "Question? Answer." pairs. Fix: drop the setup; make the point.

**R4 Negative listing.** "Not a framework. Not a library. A way of thinking." Fix: say the thing.

**R5 Dramatic fragmentation.** "X. And Y. And Z." / "That's it. That's the whole thing." Fix: complete sentences.

**R6 Robotic rhythm.** Repeated sentence shapes, identical paragraph structures, stacked punchy fragments, every paragraph the same length. Fix: vary length and shape where it helps the point. Let some mess in.

## E - Endings

**E1 Fake-profound kickers.** A final line that turns the point into a metaphor, aphorism, or mic drop: "The future isn't coming. It's already here." Fix: delete it. Do not rewrite it into a better metaphor. End on the clearest concrete sentence already in the draft, or add a plain next action.

**E2 Summary recaps.** "In conclusion", "Ultimately", "Overall", or a closing paragraph that restates the piece. Fix: cut. The reader was just there.

## A - Communication artifacts

**A1 Chatbot phrases.** "I hope this helps!", "Let me know if…", "Of course!", "Certainly!", "Great question!", "Found the smoking gun!". Fix: remove.

**A2 Cutoff disclaimers.** "While specific details are limited…", "As of my last update…". Fix: find the fact or cut the sentence.

**A3 Sycophancy.** "You're absolutely right!", "Excellent point!". Fix: respond directly.

## X - Filler

**X1 Filler phrases.** "In order to" → "To". "Due to the fact that" → "Because". "It is important to note that" → delete. Also: "it's worth noting", "at the end of the day", "when it comes to", "at its core", "in today's world", "in the age of", "the reality is", "in terms of", "with regard to", "going forward", "in this article", "let's dive in".

**X2 Hedging stacks.** "could potentially possibly be argued that it might" → "may". Keep a single "I think" or "maybe" when it expresses real uncertainty or the writer's spoken rhythm.

**X3 Empty adverbs.** just, literally, honestly, simply, actually, truly, fundamentally, importantly, crucially, inherently, inevitably, significantly. Fix: cut when they add nothing; keep when they carry emphasis, contrast, or the writer's voice. "significantly improves" → the measured delta. Never flag a single "honestly", "I think", "maybe", or "to be honest" set off by commas mid-sentence - that is spoken rhythm; it belongs on the Voice Card's Keep line, not in the findings.

**X4 Interpretive metadiscourse.** Lines that step outside the subject to tell the reader what to notice: "That last part matters more than it sounds", "The key point is", "As you can see", "This distinction matters", redundant "In other words". Fix: delete if the point is already clear; otherwise replace with support.

## J - Jargon and plain speech

**J1 Abstract metaphor nouns.** substrate, wedge, vector, locus, vantage, nexus, primitive (as noun), harness (as metaphor), bedrock, scaffolding (as metaphor), modality, paradigm, gold-plating, ratchet (as metaphor), evacuate (for moving code), endgame, north star, flywheel. Fix: the concrete word. "Substrate" → "base". "Wedge in" → "add". "Vector" → "way". "Gold-plating" → "more than the job needs". "Endgame" → "the last phase".

**J2 Says how it feels, not what it does.** "the database stays close at hand", "SQL you can read", "types that follow your schema". Fix: name the mechanism or the number. "`.toSQL()` returns the exact string sent to the database". If it cannot be restated as an instruction, fact, or number, cut it.

**J3 Dense sentences.** The reader backtracks to parse it. Fix: split, or drop clauses. One idea per sentence. Keep a long spoken sentence when it is clear and characteristic of the writer.

**J4 Passive voice.** "is/are/was/were + past participle" with a known actor. Fix: name the actor. "the file is parsed by the loader" → "the loader parses the file". Passive is fine when the actor is unknown or does not matter.

**J5 Portability failure.** A sentence that could appear unchanged in another project's docs, another company's post, another writer's essay. Fix: cut, or replace with a fact, example, mechanism, consequence, or judgement specific to this subject.
