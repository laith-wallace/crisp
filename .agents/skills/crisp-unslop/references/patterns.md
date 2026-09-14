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
