---
status: draft
primary_keyword: "AI design review"
slug: /tutorials/ai-design-review
canonical: https://getcrisp.design/tutorials/ai-design-review
meta_title: "AI Design Review: Grade Any UI in 30 Seconds | CRISP"  # 52 chars
meta_description: "Run an AI design review that grades your UI A to F and returns the top 3 fixes. Free method and skill - audit your screen in 30 seconds."  # 136 chars
og_image: TODO 1200x630 (original diagram: CRISP dimensions + grade card mockup)
video: planned (Laith recording)
internal_links: /tutorials/wcag-2-2-checklist, /tutorials/ux-laws-for-interface-design, /tutorials/ui-microcopy-guide, /skills/crisp-review
source_skill: skills/crisp-review.md v1.2.0
---

# AI Design Review: How to Grade Any UI in 30 Seconds

An AI design review is a structured evaluation where an AI assistant with codebase access grades your interface against fixed criteria and returns prioritised, specific fixes. Done properly it produces a letter grade derived from counted issues, the top three problems ranked by user impact, and an exact fix for each - in under a minute.

> **TL;DR**
> Most AI design feedback is vague because the prompt is vague. A real AI design review needs four things: fixed evaluation dimensions, a countable grading scale, evidence from the actual code, and a hard cap on output (top 3 issues, not thirty). This tutorial gives you the full method - the five CRISP dimensions, the P0-P3 severity scale, the grade table - and the free `/crisp-review` skill that runs it in one command.

**Author:** Laith Wallace - designer-engineer and author of the CRISP design skill pack.
**Last updated:** 6 August 2026

## What is an AI design review?

> **Definition:** An AI design review is a design critique performed by an AI agent (such as Claude Code) that can read your actual component code, styles, and design tokens, evaluate them against explicit criteria, and cite file and line for every issue it raises. It differs from asking a chatbot "how does this look?" in the same way a structured code review differs from "is this code good?".

The failure mode of naive AI feedback is universality: ask for opinions and you get thirty observations of equal weight, half of them generic. The fix is the same one design teams discovered for human critique: fix the dimensions, count the issues, cap the output. This mirrors how [Nielsen's heuristic evaluation](https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/) structured expert review in 1994 - the difference is that an AI reviewer can verify every claim against the code before making it.

## The five CRISP dimensions

A review needs a fixed lens, or every run measures something different. CRISP evaluates five:

- **C - Contextual.** Does the user know where they are within 5 seconds? Clear hierarchy, one primary emphasis per view, spatial groupings that match meaning.
- **R - Responsive.** Does every interaction feel instant? Feedback within 400ms, optimistic updates, no unexplained waits.
- **I - Intelligent.** Is data presented as insight rather than inventory? Chunked, compared, contextualised - not dumped.
- **S - Seamless.** Does the user stay in flow? No dead-end states, no modal detours for routine actions, easy targets for frequent actions.
- **P - Powerful.** Is complexity hidden from those who don't need it? A clear path for novices, depth for power users.

These map directly onto the perceptual laws covered in [UX laws for interface design](/tutorials/ux-laws-for-interface-design): an R violation is usually a Doherty Threshold failure, a C violation traces to Von Restorff or Proximity, a P violation to Hick or Miller.

## Grades must be countable, not vibes

An AI asked to "grade this UI" with no rubric will cluster around B+ forever. The fix is to derive the grade from counted issues. First rate every issue found on a severity scale:

| Severity | Meaning |
|----------|---------|
| P0 | Blocks users entirely - core task cannot be completed |
| P1 | Major friction - task completable but users will struggle |
| P2 | Noticeable degradation with a workaround |
| P3 | Polish |

Then the grade follows mechanically:

| Grade | Rule |
|-------|------|
| A | Zero P0, zero P1 - ship it |
| B | Zero P0, one or two P1s |
| C | Zero P0, three or more P1s - functional but frustrating |
| D | One P0 - core experience broken |
| F | Two or more P0s - don't ship |

This makes grades comparable across runs. If last month's review was a C and today's is a B, that is a real, countable improvement, not a mood change.

## The slop check: run it before anything else

Before evaluating dimensions, one five-second pre-check: **would someone look at this and immediately say "AI made that"?**

The tells are now well documented: the hero-metric template (big number with a gradient accent), identical card grids, side-stripe borders, gradient text, glassmorphism as the default surface, and generic sans-serif on off-white with no evident design decision. Any one tell present is a fail, and it is a disqualifier, not a dimension - a screen can score well on all five CRISP dimensions and still read as template output, which destroys user trust before a single interaction.

This check matters more every month, because generated UI is converging on a recognisable house style, and distinctiveness is becoming a trust signal.

## Evidence: no citation, no finding

The single biggest quality difference between a useful AI review and a useless one: when the target is a live codebase, every issue must be verified against the code and cited by file and line. "The empty state could be improved" is an impression. "[C] Empty state in `DealsList.tsx:84` says 'No data' with no CTA - replace with 'You haven't added any deals yet' plus an Add deal button" is a finding someone can act on in the next commit.

This is also what separates weak from strong feedback generally:

| Weak | Strong |
|------|--------|
| "The empty state could be improved" | "[C] Empty state says 'No data' with no CTA. Replace with: 'You haven't added any suppliers yet. [Add your first supplier]'" |
| "Loading feels slow" | "[R] Filter waits for the API before updating. Switch to optimistic filtering - show results immediately, reconcile in background" |
| "The dashboard shows too much" | "[P] 11 metrics at equal weight. Promote the 3 most-used to hero cards, collapse the rest" |

The wording of those replacement strings is its own craft - covered in the [UI microcopy guide](/tutorials/ui-microcopy-guide).

## Cap the output: top 3 issues only

A thirty-item findings list gets bookmarked and ignored. A review built for iteration surfaces the single most critical issue per dimension, then keeps only the top three by user impact, each with a one-sentence problem and a one-sentence fix. Everything else compresses into a short "quick wins" list. The discipline is the point: forcing rank forces judgement, and three fixes actually ship.

## Run it in one command with /crisp-review

The whole method above is packaged as the free [`/crisp-review` skill](/skills/crisp-review) for Claude Code. Point it at a screen, component, or route and it runs the slop check, scans all five dimensions against your actual code, and returns the grade, the top three issues with file-and-line citations, and quick wins - in about 30 seconds. It also appends each grade to a history log in your project, so you can watch the trend across iterations.

For deeper passes when a screen matters: the full `/crisp-audit` scores every dimension individually, and the [WCAG 2.2 checklist](/tutorials/wcag-2-2-checklist) covers the accessibility layer a quick scan flags but does not exhaust.

## FAQ

### Can AI actually review design quality?

Yes, with two conditions: fixed criteria and code access. An AI with your components and design tokens can verify contrast, count choices at decision points, measure hit areas, trace loading behaviour, and check copy against concrete rules - and cite file and line for each. What it cannot do from a prompt alone is taste-check a vague screenshot description, which is why unstructured "how does this look?" prompts produce generic feedback.

### What is the difference between an AI design review and a design audit?

Depth and cadence. A review is a 30-second diagnostic for rapid iteration: one grade, top three issues, quick wins. An audit is a comprehensive evaluation that scores every dimension individually, benchmarks against world-class products, and produces a prioritised action plan across all findings. Run reviews continuously while building; run an audit before a launch or redesign.

### How accurate are AI-generated design grades?

Accurate to the extent they are countable. A grade derived from counted P0 and P1 issues against explicit rules is reproducible: two runs on the same code produce the same grade, and improvement between runs reflects real fixes. A grade produced by asking an AI for its overall impression is not reproducible and should not be trusted. The rubric, not the model, is what makes the number mean something.

### What should I fix first after a design review?

P0 issues, always - anything that blocks a user from completing a core task, which includes accessibility blockers like keyboard traps and unlabelled controls. Then P1 friction in your highest-traffic flow. Resist fixing P3 polish first even though it is tempting and easy; a beautiful screen that users cannot operate is still broken.

---

*Publish checklist: validate Article + FAQPage schema, confirm canonical, OG image 1200x630 WebP, add internal link from an existing high-traffic page.*

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "AI Design Review: How to Grade Any UI in 30 Seconds",
      "datePublished": "TODO",
      "dateModified": "2026-08-06",
      "author": {
        "@type": "Person",
        "name": "Laith Wallace",
        "description": "Designer-engineer and author of the CRISP design skill pack"
      },
      "publisher": { "@type": "Organization", "name": "CRISP", "url": "https://getcrisp.design" }
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        { "@type": "Question", "name": "Can AI actually review design quality?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, with fixed criteria and code access. An AI with your components and tokens can verify contrast, count choices, measure hit areas, trace loading behaviour, and cite file and line for each finding. Unstructured prompts produce generic feedback." } },
        { "@type": "Question", "name": "What is the difference between an AI design review and a design audit?", "acceptedAnswer": { "@type": "Answer", "text": "Depth and cadence. A review is a 30-second diagnostic: one grade, top three issues, quick wins. An audit scores every dimension, benchmarks against world-class products, and produces a full action plan. Review continuously; audit before launches." } },
        { "@type": "Question", "name": "How accurate are AI-generated design grades?", "acceptedAnswer": { "@type": "Answer", "text": "Accurate when countable. A grade derived from counted P0 and P1 issues against explicit rules is reproducible across runs. A grade from an overall impression is not. The rubric, not the model, makes the number meaningful." } },
        { "@type": "Question", "name": "What should I fix first after a design review?", "acceptedAnswer": { "@type": "Answer", "text": "P0 issues first - anything blocking a core task, including accessibility blockers. Then P1 friction in the highest-traffic flow. Resist fixing polish first; a beautiful screen users cannot operate is still broken." } }
      ]
    }
  ]
}
```
