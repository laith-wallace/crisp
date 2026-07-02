---
name: crisp-funnel
description: Assembles a complete mobile-first funnel from a client brief. Classifies the funnel type, selects and sequences sections from the CRISP Funnel Kit, writes the copy to the offer and the audience's awareness level, and hands off to crisp-review before delivery. Triggered by /crisp-funnel. Reads .crisp.md for project context. Use whenever Laith needs to build a client lead-gen, application, webinar, or sales funnel fast.
version: "1.0.0"
metadata:
  author: Laith Wallace — FlowConverts
---

# CRISP Funnel Assembly — `/crisp-funnel`

You assemble funnels. You do not invent a layout per project. You select from a fixed library of tested sections, sequence them to the funnel type, and write the copy to the offer and the audience. Speed comes from the library. Quality comes from the sequence and the copy. Every funnel passes crisp-review before it leaves.

The section library is `crisp-funnel-kit.html`. It holds ten sections. Reference them by name and number. Do not design new section types inside this skill. If a brief needs a section the library does not have, flag it for a library addition rather than improvising one.

---

## The library — ten sections

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

---

## Step 0 — Read context

Check for `.crisp.md` in the project root. If present, read it and extract product type, primary users and their goals, defined benchmarks, and design system conventions. If absent, note it. You will work generically and flag the gap in your output.

---

## Step 1 — Parse the brief

The brief must establish at least:
- The offer (what the visitor gets)
- The audience (who they are)
- The goal (the one action: book a call, apply, register, buy, opt in)
- The traffic source (paid social, organic, email, referral)

If any of the four is missing, ask exactly one question covering the largest gap. One question only. Wait for the answer. Do not assemble on guesses.

---

## Step 2 — Classify the funnel type

Map the brief to one type. The type sets the default sequence.

| Funnel type | Goal | Default sequence |
|---|---|---|
| **Appointment** | Book a call | 01 → 02 → 04 → 05 → 07 → 08 → 09 → 10 |
| **Application / recruiting** | Apply | 01 → 02 → 03 → 05 → 07 → 08 → 10 |
| **Webinar / registration** | Register | 01 → 04 → 05 → 07 → 08 → 10 |
| **Direct sale** | Buy | 01 → 02 → 04 → 05 → 06 → 07 → 08 → 10 |
| **Email list / freebie** | Opt in | 01 → 02 → 07 → 08 → 10 |

The sequence is a starting point, not a rule. Adjust it in Step 3 to the awareness level.

---

## Step 3 — Set the sequence by awareness level

Use Schwartz awareness levels to add or cut sections. Warmer traffic gets a shorter funnel.

- **Unaware / problem-aware** — keep the value step (04) and proof (05). They need belief built before the offer. Consider two qualifier steps.
- **Solution-aware** — keep proof (05), cut or shorten the value step (04). They believe the category, they need to trust you.
- **Product-aware / most-aware** — cut 04, keep a single proof line, move fast to offer and capture. Five sections or fewer.

State the awareness level you assumed. It is the single biggest driver of length, and it is the gap most briefs leave open.

---

## Step 4 — Write the copy

Write every section to the offer and the audience. Apply these standards.

**Headlines (Ogilvy).** Lead with the outcome the visitor gets, not the feature you provide. Specific beats clever. Research the audience's actual words from the brief and use them.

**Offer (Hormozi).** Make the value obvious and the action singular. Three concrete deliverables on the offer screen, never a paragraph of claims. Name what they get, then stop selling.

**Persuasion (Cialdini).** Place proof at the decision point, not in a section of its own. Use commitment: each qualifier answer is a small yes that makes the opt-in the natural next yes.

**Voice.** British English. Active voice. Outcome-first. No hyperbole, no exclamation marks. Match the client's register, not the CRISP brand voice, unless the client is CRISP.

**Per-section copy rules:**
- Hook (01): headline matches the ad creative word for word. One action. Three trust microcopy lines.
- Qualifier (02, 03): the question uses the audience's language. Three to four options. No jargon.
- Value (04): one stat, one claim, one line. Never a wall.
- Proof (05): one named result, a problem before and a number after. If no real proof exists, leave the placeholder and flag it. Never invent a testimonial.
- Offer (07): three deliverables, one CTA, action verb plus benefit.
- Capture (08): the fewest fields the goal needs. Earn every field.
- Confirmation (10): confirm the action, restate any booking, name the next step.

---

## Step 5 — Output the funnel

Return this structure. Do not deviate.

```
/crisp-funnel: [Client / Offer]
─────────────────────────────────────────────────────

FUNNEL TYPE
[Type] · awareness assumed: [level] · traffic: [source]

SEQUENCE
[01 Hook] → [02 Qualifier] → ... → [10 Confirmation]
[note any section cut or added, with the reason]

─────────────────────────────────────────────────────

SECTION-BY-SECTION

[01 — Hook] · C
Headline: [copy]
Sub: [copy]
CTA: [copy]
Trust: [line · line · line]

[02 — Qualifier] · R · I
Question: [copy]
Options: [a · b · c · d]

[... every section in the sequence ...]

─────────────────────────────────────────────────────

OPEN QUESTIONS FOR CLIENT
· [largest gap the brief left, named not softened]
· [second gap, only if it changes the build]

─────────────────────────────────────────────────────

→ Building HTML from crisp-funnel-kit.html sections
→ Then running crisp-review before delivery
```

---

## Step 6 — Build and review

1. Assemble the HTML by pulling the named sections from `crisp-funnel-kit.html` in sequence and dropping in the Step 4 copy. Keep the tokens, the primitives, and the interaction behaviour intact. Do not restyle.
2. Run `/crisp-review` on the assembled funnel. Return the grade and the top three issues with fixes.
3. Apply the fixes. Re-run if the grade is below B.
4. Only then present to the client.

No funnel ships unaudited. The review pass is the difference between this kit and a template marketplace.

---

## Output rules

- British English throughout.
- CRISP voice in your own commentary. Client voice in the funnel copy.
- Name the awareness level you assumed, every time.
- Maximum two open questions. Name gaps, do not soften them.
- Never invent proof. A placeholder with a flag beats a fabricated testimonial.
- Do not design new section types here. Flag library gaps instead.

---

## Relationship to other CRISP skills

```
/crisp-teach     →  writes .crisp.md (run first, once per project)
/crisp-funnel    →  THIS SKILL: brief in, sequenced funnel out
/crisp-review    →  30-second audit, runs on every assembled funnel
/crisp-audit     →  full scored evaluation when a funnel needs depth
/handoff         →  developer-ready spec if the client builds it themselves
```

---

## What this skill does not do

- Does not design new section types (flag a library gap instead).
- Does not host or publish the funnel (that is the client's stack or a deploy step).
- Does not run ads or write ad creative (it matches the hook to existing creative).
- Does not invent testimonials or proof.
- Does not skip the crisp-review pass.

---

*CRISP Funnel Assembly Skill — getcrisp.design*
*Pairs with crisp-funnel-kit.html · Part of the CRISP skill pack*
