---
name: crisp-funnel
description: Build, critique, and optimise high-converting funnels and landing pages using the ATM (Attention, Trust, Money) methodology and the CRISP Funnel Kit's ten-section library. Use whenever the user is designing, writing, auditing, or fixing a funnel, landing page, opt-in page, sales page, lead-gen offer, ad-to-page flow, or conversion path; or when they mention conversion rate, CAC vs CPL, stages of awareness, lead qualification, or why a page or campaign is not converting, even if they never say the word "funnel". Triggered by /crisp-funnel. Reads .crisp.md for project context.
version: "2.0.0"
metadata:
  author: Laith Wallace - FlowConverts
---

# CRISP Funnel Architect - `/crisp-funnel`

Engineer acquisition systems, not pages.

This skill does two jobs: **build** a funnel from a brief, and **critique** an existing one. Both run on the same methodology. Read this core, then load exactly one mode:

- Building from a brief, or rebuilding a failing funnel → `references/build-mode.md`
- Auditing or fixing an existing funnel → `references/critique-mode.md`
- Either mode → `references/landing-page-and-copy.md` for page structure, copy voice, ad angles, and form design.

The section library for step funnels is `crisp-funnel-kit.html`. It holds ten tested sections. Reference them by name and number. Do not design new section types; if a brief needs one the library lacks, flag it for a library addition.

## The one idea

A funnel is the sum of every touchpoint a prospect has with a brand, and every touchpoint is a place revenue leaks. You are not writing a page. You are choreographing a sequence of small commitments: sell the click, then the lead, then the call, then the sale. Each stage has exactly one job. It either earns the next micro-yes or it leaks.

Three forces decide the outcome, in this order:

**Psychology + Economics × Technology.**

Technology multiplies whatever the first two produce, including zero. A polished page on a broken offer is 1,000 × 0. Fix the message and the maths before touching the build. When a funnel underperforms, suspect the offer and the message first, the design second, the tooling last.

## Perception beats reality

A prospect cannot experience the product before buying, so they buy on perceived authority, not on the quality of the code or the service. Proof, specificity, and a named method exist to make the perception match the reality already being delivered. This is why a genuinely excellent service still needs a funnel: without evidence, quality is invisible at the point of decision.

## Two formats

Every build resolves to one of two formats. Choose before writing a word:

- **Step funnel** - a mobile-first sequence of single-purpose screens assembled from the ten-section kit. Default for lead-gen, application, webinar, and quiz-style flows where each screen earns one micro-yes.
- **Long-form landing page** - a single scrolling page following the eight-block hierarchy in `references/landing-page-and-copy.md`. Default for consultation offers to problem- or solution-aware traffic that needs a story built before the ask.

Colder traffic and higher-ticket offers lean long-form. Warmer traffic and self-serve offers lean step funnel. State the format you chose and why.

## Match the message to awareness

Message length and directness are set by how much the prospect already knows. Eugene Schwartz's five stages, from cold to hot:

- **Unaware** - does not know they have the problem. Rarely worth paid acquisition. Needs education and content, not a sales page.
- **Problem aware** - feels the pain, does not know solutions exist. Wants a long-form story lead that names the pain and introduces the category. Pairs with a consultation offer.
- **Solution aware** - knows solution types, comparing approaches. Position your mechanism as the better approach.
- **Product aware** - knows you, comparing you to competitors. Short and direct: proof, differentiation, risk reversal. A ready-now offer works here.
- **Most aware** - ready to buy, needs the deal. Shortest path: terms, price, CTA.

The rule: as awareness rises, the page gets shorter and more direct. Matching a short direct-to-offer layout to a problem-aware market fails, and so does burying a most-aware buyer in a long story lead. Name the awareness level you assumed, every time. It is the single biggest driver of length, and it is the gap most briefs leave open.

## Pick the offer to match

- **Consultation offer** (diagnose, then prescribe). For lower-intent, problem- or solution-aware markets, and higher-ticket sales that need a conversation. Framed as a diagnostic: "30-minute spend audit", not "buy now".
- **Ready-now offer** (act now). For high-intent, product- or most-aware traffic. Sells speed and certainty: start a trial, get a quote, book the demo.

Choosing the wrong one is a common cause of a page that gets traffic but no conversions.

## Optimise the right number

Track **CAC and ROI, not CPL**. A low cost per lead that fills the pipe with poor-fit leads raises the cost to acquire a customer downstream: wasted sales time, low close rate. Be willing to raise CPL if it lowers CAC. The metrics that matter run deeper than volume: cost per qualified lead, show-up rate, close rate. Set one named primary metric before launch so every later test has a target to move.

## Friction is a filter, not a flaw

Two kinds of friction exist and they need opposite treatment.

- **Qualifying friction** is intentional. A multi-step form of 3 to 7 questions filters out poor-fit leads and makes a good-fit prospect articulate their own need, which sells them back into the offer. An application frame adds authority and scarcity. Keep this.
- **Accidental friction** is a leak: slow load, a confusing form, a broken calendar, a timezone error. Remove this without mercy.

Adding qualifying questions can raise conversion of the leads that matter even as it lowers raw lead count. That is the point.

## The ATM frame

Three engines, run in sequence.

**Attention.** Dog-whistle language names the specific audience and pain so the right people lean in and the wrong ones self-select out. Ad-to-page congruence is non-negotiable: the page headline must echo the ad hook, or the click bounces.

**Trust.** The landing page is the digital salesperson. Give the process a named, memorable mechanism so it stops reading as a commodity. Stack proof at every decision point. Pre-handle the top objections before they form.

**Money.** The conversation. Diagnose like a doctor, do not take orders like a waiter. Choreograph the dead time between booking and call with a pre-suade sequence (reminders, proof, objection killers) to lift show-up rate. Reframe the thank-you page as a congratulation and a forward-look, not gratitude.

## The library - ten sections

| # | Section | CRISP dimension | Job |
|---|---|---|---|
| 01 | Hook | C | Ad-match entry. One outcome headline, one action. |
| 02 | Qualifier | R · I | Single-select. Qualifies and starts personalisation. |
| 03 | Multi-select | R · I | Multiple valid answers. State-reporting continue button. |
| 04 | Value / belief step | I | One insight that raises belief before the ask. |
| 05 | Social proof | I | One specific result at the decision point. |
| 06 | Loader / processing | R · I | Short determinate wait. Makes the result feel computed. |
| 07 | Offer | C · P | Three concrete deliverables, one action. |
| 08 | Capture form | R · S | Three fields, blur validation, autofill. |
| 09 | Booking | S | In-funnel slot selection. No redirect. |
| 10 | Confirmation | C · S | Confirms the action, names the next step. |

## Benchmarks

When critiquing or citing patterns, compare against strong B2B SaaS acquisition pages. Default set: **Stripe, Linear, Notion**. Swap or extend if the user names their own references. Show a concrete example of a pattern done well rather than abstract advice: name what the exemplar does and why it converts, then map it to the page in front of you.

## Voice and house rules

- British English throughout.
- CRISP voice in your own commentary. Client voice in the funnel copy: match the client's register unless the client is CRISP.
- Active voice. Outcome-first. Zero hyperbole, zero exclamation marks.
- If the user has their own writing rules or brand voice, those win. Apply them to the output copy without asking.

## Relationship to other CRISP skills

```
/crisp-teach     →  writes .crisp.md (run first, once per project)
/crisp-funnel    →  THIS SKILL: build or critique, brief in, funnel out
/crisp-review    →  30-second scan, runs on every assembled funnel
/crisp-audit     →  full scored evaluation when a funnel needs depth
/handoff         →  developer-ready spec if the client builds it themselves
```

## What this skill does not do

- Does not design new section types (flag a library gap instead).
- Does not host or publish the funnel (that is the client's stack or a deploy step).
- Does not run the ad campaigns (it writes the angles and matches hook to page).
- Does not invent testimonials or proof. A placeholder with a flag beats a fabricated testimonial.
- Does not skip the crisp-review pass on any assembled build.

---

*CRISP Funnel Architect - getcrisp.design*
*Pairs with crisp-funnel-kit.html · Part of the CRISP skill pack*


---

<!-- references/build-mode.md -->

# Build Mode

Use this when the user wants a new funnel built from a brief, or a rebuild of a failing one. Read the SKILL.md core first, then work the seven steps below in order. Page structure, copy voice, ad angles, and form design live in `landing-page-and-copy.md`.

## Step 0 - Read context

Check for `.crisp.md` in the project root. If present, read it and extract product type, primary users and their goals, defined benchmarks, and design system conventions. If absent, note it, work generically, and flag the gap in your output.

## Step 1 - Research the inputs

Garbage in, garbage out. Marketing is inputs and outputs, and the input is the customer's own language. Do not invent copy from imagination when real language is available. Three sources, in order of value:

- **Insight surveys** of existing customers. Ask questions that surface language and objections: "How would you describe us to a colleague?", "What nearly stopped you buying?", "What were you doing before us, and what was wrong with it?"
- **Sales-call mining.** Read call transcripts or notes for recurring objections and the exact phrases prospects use. Marketing's words are not the customer's words. The customer's words convert.
- **Journal mining.** Read Reddit threads, review sites, and community posts where the audience describes the pain unprompted. This is where the visceral, unfiltered language lives.

Output: a swipe file of real phrases, the top objections, and a clear before-state and after-state in the customer's own words. If the user has no research yet, say so, and either gather it or name the assumption you are making in the open questions.

Whatever the research state, the brief must establish four things:

1. The offer (what the visitor gets)
2. The audience (who they are)
3. The goal (the one action: book a call, apply, register, buy, opt in)
4. The traffic source (paid social, organic, email, referral)

If any of the four is missing, ask exactly one question covering the largest gap. One question only. Wait for the answer. Do not assemble on guesses.

## Step 2 - Set the strategy

Five decisions, made explicitly and stated in the output:

1. **Awareness stage.** Fix it (see core). It sets length and directness.
2. **Offer type.** Consultation or ready-now (see core). It sets the CTA and the whole shape.
3. **Format.** Step funnel from the kit, or long-form landing page (see core, "Two formats").
4. **Named mechanism.** Give the process a concrete, benefit-anchored name. A named method turns a commodity service into a specific authority and makes the outcome feel owned. Avoid clever-but-empty names; the name should hint at the result.
5. **The transformation.** Write the before-state to after-state in one line. Everything in the funnel serves this arc.

## Step 3 - Sequence the funnel

For a **step funnel**, map the brief to one type. The type sets the default sequence from the kit.

| Funnel type | Goal | Default sequence |
|---|---|---|
| **Appointment** | Book a call | 01 → 02 → 04 → 05 → 07 → 08 → 09 → 10 |
| **Application / recruiting** | Apply | 01 → 02 → 03 → 05 → 07 → 08 → 10 |
| **Webinar / registration** | Register | 01 → 04 → 05 → 07 → 08 → 10 |
| **Direct sale** | Buy | 01 → 02 → 04 → 05 → 06 → 07 → 08 → 10 |
| **Email list / freebie** | Opt in | 01 → 02 → 07 → 08 → 10 |

The sequence is a starting point, not a rule. Adjust it to the awareness stage:

- **Unaware / problem-aware** - keep the value step (04) and proof (05). They need belief built before the offer. Consider two qualifier steps.
- **Solution-aware** - keep proof (05), cut or shorten the value step (04). They believe the category; they need to trust you.
- **Product-aware / most-aware** - cut 04, keep a single proof line, move fast to offer and capture. Five sections or fewer.

For a **long-form landing page**, follow the eight-block hierarchy in `landing-page-and-copy.md`. Single purpose, no global navigation, one primary CTA repeated.

## Step 4 - Write the copy

Write every section to the offer and the audience, using the swipe file from Step 1. Apply these standards.

**Headlines (Ogilvy).** Lead with the outcome the visitor gets, not the feature you provide. Specific beats clever. Use the audience's actual words from the research.

**Offer (Hormozi).** Make the value obvious and the action singular. Three concrete deliverables on the offer screen, never a paragraph of claims. Name what they get, then stop selling.

**Persuasion (Cialdini).** Place proof at the decision point, not in a section of its own. Use commitment: each qualifier answer is a small yes that makes the opt-in the natural next yes.

**Voice.** As set in the core: British English, active voice, outcome-first, zero hyperbole, zero exclamation marks, client register. Full copy voice guidance is in `landing-page-and-copy.md`.

**Per-section copy rules (step funnels):**

- Hook (01): headline matches the ad creative word for word. One action. Three trust microcopy lines.
- Qualifier (02, 03): the question uses the audience's language. Three to four options. No jargon.
- Value (04): one stat, one claim, one line. Never a wall.
- Proof (05): one named result, a problem before and a number after. If no real proof exists, leave the placeholder and flag it. Never invent a testimonial.
- Offer (07): three deliverables, one CTA, action verb plus benefit.
- Capture (08): the fewest fields the goal needs. Earn every field.
- Confirmation (10): confirm the action, restate any booking, name the next step. Congratulate and point forward; do not just thank.

## Step 5 - Output the build plan

Return this structure. Do not deviate.

```
/crisp-funnel: [Client / Offer]
─────────────────────────────────────────────────────

STRATEGY
Format: [step funnel / long-form page] · funnel type: [type]
Awareness assumed: [level] · offer type: [consultation / ready-now]
Traffic: [source]
Mechanism: [the named method]
Transformation: [before-state] → [after-state]

SEQUENCE
[01 Hook] → [02 Qualifier] → ... → [10 Confirmation]
[note any section cut or added, with the reason]

─────────────────────────────────────────────────────

SECTION-BY-SECTION

[01 - Hook] · C
Headline: [copy - two or three options where a real choice exists]
Sub: [copy]
CTA: [copy]
Trust: [line · line · line]

[02 - Qualifier] · R · I
Question: [copy]
Options: [a · b · c · d]

[... every section in the sequence ...]

─────────────────────────────────────────────────────

ADS
[one line per angle across the five angles - see landing-page-and-copy.md]

TRACKING
Primary: [the one named metric]
Secondary: [two or three: cost per qualified lead, show-up rate, close rate]

OPEN QUESTIONS FOR CLIENT
· [largest gap the brief left, named not softened]
· [second gap, only if it changes the build]

─────────────────────────────────────────────────────

→ Building HTML from crisp-funnel-kit.html sections
→ Then running crisp-review before delivery
```

Keep it decision-ready. Give options where a real choice exists (headlines), single recommendations where it does not. Maximum two open questions.

## Step 6 - Assemble and review

1. Assemble the HTML by pulling the named sections from `crisp-funnel-kit.html` in sequence and dropping in the Step 4 copy. Keep the tokens, the primitives, and the interaction behaviour intact. Do not restyle.
2. Run `/crisp-review` on the assembled funnel. Return the grade and the top three issues with fixes.
3. Apply the fixes. Re-run if the grade is below B.
4. Only then present to the client.

No funnel ships unaudited. The review pass is the difference between this kit and a template marketplace.

## Step 7 - Instrument tracking

Set this up before launch, not after.

- Primary: CAC and ROI. Then cost per qualified lead, show-up rate, close rate.
- Qualitative: session recordings and heatmaps so you can see where people stall, not just that they left.
- One named primary metric so every later test has a target to move.

## Pre-delivery checklist

Before calling a build done, confirm each:

- [ ] Ad-to-page congruence: the page headline mirrors the ad hook that earned the click.
- [ ] Mobile-first: single-column layout, CTA in the thumb zone, load under 3 seconds.
- [ ] Form qualifies without over-asking: 3 to 7 questions, each pulling its weight.
- [ ] Micro-step test: every CTA asks for the next logical small commitment, not a leap.
- [ ] Awareness level named in the output.
- [ ] No invented proof anywhere: every testimonial and number is real or flagged as placeholder.
- [ ] crisp-review pass run, grade B or above.


---

<!-- references/critique-mode.md -->

# Critique Mode

Use this when the user asks why a funnel is not converting, or wants an audit of an existing page, campaign, or path. Read the SKILL.md core first. This mode blends the funnel frame with severity-rated findings and benchmarks against strong exemplars.

Do not audit everything at once. A generic pass over the whole funnel wastes the user's attention. Find where it actually leaks, then rank fixes by impact.

For depth beyond conversion (full CRISP dimension scoring), hand off to `/crisp-audit` after this pass. For a fast sanity scan of an assembled build, `/crisp-review` is the lighter tool.

## Step 1 - Find the choke point

Locate the single stage where the system breaks. The pattern in the numbers tells you where to look:

- Traffic high, form-starts low → message or offer mismatch, or a weak above-the-fold. The click arrived and the page failed to earn the next yes.
- Form-starts high, completions low → the form is too long or asks the wrong things.
- Bookings high, show-ups low → no pre-suade sequence between booking and call.
- Show-ups high, closes low → an offer or sales-conversation problem, not a page problem. Do not redesign the page.

For a step funnel built from the kit, map the drop to the section:

- Drop at Hook (01) → ad-to-page congruence broken, or the headline states a feature not an outcome.
- Drop at Qualifier (02/03) → wrong question, jargon in the options, or more than four options.
- Drop at Value/Proof (04/05) → belief gap: the traffic is colder than the sequence assumes.
- Drop at Offer (07) → deliverables vague, or offer type wrong for the awareness stage.
- Drop at Capture (08) → a field that has not been earned.
- Drop at Booking (09) → redirect, glitch, timezone error, or too-distant slots.

Fix the choke point first. Anything upstream of the leak is wasted effort if the leak stays open. If you lack the numbers to locate it, ask for the stage-by-stage conversion figures, or state which stage you are assuming and why.

## Step 2 - Score findings by severity

Rate every finding so the user knows what to fix first. The scale matches the CRISP P0-P3 convention used in `/crisp-audit`:

- **P0 - breaks the system.** Missing or broken CTA, no discernible offer, message-to-market mismatch, page fails on mobile, broken form or calendar. Nothing else matters until these are fixed.
- **P1 - major leak.** Weak or generic headline, no proof above the fold, offer type wrong for the awareness stage, no pre-suade flow, CTA buried below the fold.
- **P2 - friction.** Excess form fields, thin or unconvincing proof, competing navigation links, unclear next step, slow load.
- **P3 - polish.** Copy tightening, section order, micro-optimisations that add a little once the big leaks are closed.

Before flagging a form as too long, apply the core's friction filter: qualifying friction is a feature, accidental friction is a leak. Do not recommend cutting questions that qualify.

## Step 3 - Apply the 80/20

Most lift lives above the fold: the headline and the offer. If a page converts poorly, do not tweak the footer. Concentrate testing effort on the headline, offer, and hero, plus the choke point you found in Step 1. Say this to the user plainly when they are about to optimise the wrong thing.

## Step 4 - Benchmark and show, do not tell

Compare against strong B2B SaaS acquisition pages. Default: Stripe, Linear, Notion. Swap if the user names their own references or `.crisp.md` defines a benchmark set. For each significant finding, point to a concrete example of the pattern done well, name what the exemplar does, and explain why it converts. Abstract advice ("add more proof") is weaker than a specific model ("Linear leads with a single sharp promise and one product shot above the fold, so the eye lands on the value in under a second").

## Output format

- **Choke point** - one line: where it leaks and the evidence.
- **Findings** - grouped by severity, highest first. Each finding states the problem, the fix, and the conversion rationale (why this change moves the number).
- **Fix first** - the single change to make before anything else.

Keep it tight and decision-ready. Rank by user impact, not by reading order down the page. If the fix requires a rebuild, switch to `references/build-mode.md` and carry the findings in as the brief.

## Post-launch optimisation checklist

- [ ] Isolate the choke point before changing anything.
- [ ] A/B test the headline first; put 80 percent of test effort above the fold.
- [ ] Add or upgrade the pre-suade flow to lift show-up rate.
- [ ] Run a weekly marketing and sales sync so lead-quality data feeds back into targeting.
- [ ] Audit the booking page for glitches, timezone errors, and booking delay.


---

<!-- references/landing-page-and-copy.md -->

# Landing Page, Copy, Ads, and Forms

Shared reference for both build and critique. Read the SKILL.md core first for the methodology this structure serves. The eight-block hierarchy below is the anatomy of a **long-form landing page**; step funnels follow the kit sequences in `build-mode.md` instead, but the copy voice, ad angles, and form rules here apply to both formats.

## The page hierarchy

Top to bottom. Each block has one job: earn the scroll to the next. A single-purpose page has no global navigation. The only action is the primary CTA, repeated.

1. **Above the fold** - headline (the big promise, in dog-whistle language for the target), a subhead that states the mechanism or a proof point, one primary CTA, one hero visual. The eye should stub its toe on the headline and the CTA within a second.
2. **The lead** - problem, agitate, solve. Name the pain in the customer's words, raise the stakes so the cost of inaction is felt, then introduce the solution.
3. **Proof** - testimonials, client logos, results, screenshots. Video proof with a bold summary headline above each clip so it cannot be skimmed past. Stack proof at every point where a prospect might hesitate.
4. **Reasons why** - the concrete, specific reasons to act now. Use as many as are true and specific; vague reasons weaken the set.
5. **How it works** - the named mechanism in three or four steps. This makes the outcome feel inevitable and the process feel owned rather than generic.
6. **The offer stack** - what they get, framed by value not features. For a consultation offer, stack the value of the call itself so the free thing feels worth showing up for.
7. **FAQ** - objection handling in disguise. Turn the top objections from the research into questions and answer them straight. Three to five FAQs covering the top objections.
8. **Page full stop** - a final CTA and a hard close. No wandering links, no footer maze that offers an exit.

When critiquing, check these in order and flag the first block that fails to earn the next scroll. That is usually where the leak starts.

## Copy voice

- Write like a letter from a knowledgeable friend, not a brochure. The prospect should feel the copy describes their internal dialogue better than they could.
- Use the customer's exact language from research. Specificity signals that you understand them; generic language signals that you do not.
- One idea per line above the fold. Short sentences carry the scroll.
- Benefit first, feature second, and only features that map to a transformation. A feature with no mapped benefit is noise.
- British English. Active voice. Zero hyperbole, zero exclamation marks.
- Client voice in the funnel copy: match the client's register, not the CRISP brand voice, unless the client is CRISP. If the user has their own writing rules or brand voice, those override this default. Apply them without asking.

## Ad angles

Test five different angles against each other, not five headline variants inside one angle. Different angles find different buyers.

- **Human / relatable** - a founder story or a real face, plain talk.
- **Authority / proof** - a testimonial or results mashup.
- **Educational** - teach the unique mechanism; earn trust by being useful before asking.
- **Pattern interrupt** - a format that breaks the scroll (raw video, whiteboard, unexpected framing).
- **Direct-to-offer** - for high-intent, product-aware traffic that is ready to act.

Every ad's hook must match the page headline it points to, or the click is wasted. In a step funnel this is the Hook section (01): headline matches the ad creative word for word.

## Form design

- 3 to 7 questions, multi-step, one or a few per screen so momentum builds. In the kit these are the Qualifier (02) and Multi-select (03) sections.
- Every question either qualifies the lead or makes the prospect articulate their own need. A qualifying question that also gets the prospect to state their pain sells them back into the offer.
- Three to four options per question, in the audience's language, no jargon.
- Order easy to committing, so the small early answers create momentum for the harder ones.
- Frame as an application when the offer warrants authority and scarcity. Earned access converts better than easy access for higher-ticket offers.
- Contact capture (kit section 08) is separate from qualification: the fewest fields the goal needs, blur validation, autofill enabled. Earn every field.
