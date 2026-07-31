---
name: crisp-funnel
description: Build, critique, and optimise funnels and landing pages using the ATM (Attention, Trust, Money) methodology and the ten-section Funnel Kit. Use for any landing page, sales page, opt-in, lead-gen offer, or ad-to-page flow, or when the user mentions conversion rate, CAC vs CPL, stages of awareness, or a page that is not converting - even if they never say 'funnel'.
user-invocable: true
version: "2.1.0"
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

For direct-response and lead-gen offers (coaching, local service, info products), the SaaS defaults are the wrong register - use funnel-native exemplars instead: **Hims / Ro** (quiz-to-offer intake), **Typeform** (multi-step form craft), **Calendly** (in-flow booking), **Lemonade** (conversational qualifying). Match the exemplar set to the offer type before citing it.

### Quality gate

Before delivery, run the **Mechanical Pre-Flight Checks** from `/crisp-design-eng` on any assembled build - all ten checks are countable and all must pass.

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
