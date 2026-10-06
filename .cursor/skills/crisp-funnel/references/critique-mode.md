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
