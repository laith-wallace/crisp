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
