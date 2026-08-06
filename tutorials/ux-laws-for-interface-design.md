---
status: draft
primary_keyword: "UX laws"
slug: /tutorials/ux-laws-for-interface-design
canonical: https://getcrisp.design/tutorials/ux-laws-for-interface-design
meta_title: "UX Laws: 7 Rules That Decide If Your UI Works | CRISP"  # 53 chars
meta_description: "The 7 UX laws behind every interface decision - Fitts, Hick, Miller, Doherty and more - with the exact fix for each violation."  # 127 chars
og_image: TODO 1200x630 (original diagram: 7 laws mapped to CRISP dimensions)
video: planned (Laith recording)
internal_links: /tutorials/ai-design-review, /tutorials/ui-microcopy-guide, /skills/crisp-ux-laws
source_skill: skills/crisp-ux-laws.md v1.1.0
---

# UX Laws: The 7 Rules That Decide Whether Your Interface Works

UX laws are constraints on human perception and motor behaviour that every interface either respects or violates. The seven that matter most for product design are Fitts' Law, Hick's Law, Miller's Law, the Doherty Threshold, the Von Restorff Effect, the Law of Proximity, and the Law of Common Region. Violations have predictable, measurable consequences.

> **TL;DR**
> UX laws are not decorative theory. Each one predicts exactly how an interface fails: small distant buttons are slow to hit (Fitts), too many equal choices stall decisions (Hick), ungrouped data overloads memory (Miller), and feedback slower than 400ms breaks flow (Doherty). This tutorial explains all seven with the specific violation patterns and fixes, and shows how to check any screen against them automatically.

**Author:** Laith Wallace - designer-engineer and author of the CRISP design skill pack.
**Last updated:** 6 August 2026

## What are UX laws?

> **Definition:** UX laws are empirical findings from cognitive psychology and human-computer interaction research, formulated as design rules. Unlike style guidelines, they describe how human perception and motor control actually work, so they hold regardless of trend, brand, or platform. Most were established in peer-reviewed research decades before the web existed: Fitts (1954), Hick (1952), Miller (1956), Wertheimer (1923).

The value of learning them is diagnostic. When an interaction "feels wrong" and nobody can say why, a UX law usually names the exact cause and implies the exact fix. Jon Yablonski's [Laws of UX](https://lawsofux.com/) is a good visual reference, and [Nielsen Norman Group](https://www.nngroup.com/articles/) has decades of supporting research.

## Fitts' Law: target size and distance decide interaction speed

The time to acquire a target is a function of its size and its distance from the cursor or thumb. Smaller targets farther away take logarithmically longer to hit.

What breaks it: click targets under 24px on desktop or 44px on touch for frequent actions, confirm buttons placed far from where the action started, icon-only buttons with no padding around the icon, and row actions in a distant column instead of inline.

What applies it well: full-width mobile buttons for primary actions, menus snapped to screen edges (the edge is an infinitely deep target because the cursor stops there), inline hover actions adjacent to the content they act on, and generous padding that extends a small icon's hit area without changing its visual size.

Audit question: are the most frequent actions the easiest targets to acquire?

## Hick's Law: more choices means slower decisions

Decision time grows logarithmically with the number of options. Every additional equally-weighted choice taxes the user.

What breaks it: navigation with 10+ items at the same visual weight, settings pages that show every option to every user, modals with four or more similar actions, dropdowns longer than seven items with no search or grouping, and onboarding that demands full configuration before the user has done anything.

What applies it well: progressive disclosure that surfaces 3 to 5 primary options and collapses the rest, contextual filtering that hides irrelevant actions, role-based views, search before browse for large sets, and sensible defaults - the best interfaces let users decide by doing nothing.

Audit question: at the user's most common decision point, is there a clear recommended path, or are all options presented as equal?

## Miller's Law: working memory holds about 7 items, so chunk

Working memory holds roughly seven items, plus or minus two. The common misreading is "limit menus to 7 items". The real lesson is **chunking**: organise information so users process grouped units instead of individual items.

What breaks it: a 20-field form with no visual grouping, tables with 15 equally-weighted columns, navigation paths deeper than 4 levels, multi-step flows with no progress indicator, and dashboards that present numbers as undifferentiated lists.

What applies it well: form sections with headers (Personal, then Contact, then Preferences), grouped table columns, step indicators that show the total so users can calibrate effort, and data presented with comparison and context so it arrives pre-chunked by meaning.

Audit question: does the user ever need to hold more than 5 to 7 distinct items in memory at any point in the flow?

## The Doherty Threshold: respond in under 400ms or break flow

Productivity rises when system and user interact at a pace where neither waits on the other - in practice, feedback within 400ms. This is a perception boundary, not a performance target: below it the system feels instant, above it the user consciously notices waiting. Those are qualitatively different experiences, not points on a smooth scale. The original research is Doherty and Thadani's 1982 IBM paper, [The Economic Value of Rapid Response Time](https://jlelliotton.blogspot.com/p/the-economic-value-of-rapid-response.html).

What breaks it: filters, sorts, searches, and tab switches that wait for a network round-trip, spinners for operations whose outcome the system could predict, animations over 300ms on frequently-triggered interactions (animation is perceived delay), and firing a request on every keystroke.

What applies it well: debounced search that fires 200 to 300ms after typing stops, optimistic UI that applies the change immediately and reconciles in the background, instant local filtering on already-loaded data, hover-prefetching likely next pages, and skeleton screens for anything genuinely over 400ms - not to beat the threshold but to make the wait feel designed.

Audit question: which user actions take over 400ms to produce visible feedback, and which of those could be optimistic or local?

## The Von Restorff Effect: only the different thing gets noticed

An item that differs from its neighbours is the one users notice and remember. Isolation creates salience - which means salience is a budget you can overspend.

What breaks it: multiple elements competing at the same visual weight, a primary CTA styled like the secondary actions, status colours too muted to stand apart from neutral content, and emphasising every card or row so that emphasis stops meaning anything.

What applies it well: one and only one primary action at the highest visual weight per view, error states distinguished by hue and not just text (colour is preattentive, text is not), highlighting the anomalous data point in a chart instead of making users hunt for it, and empty states that look visibly different from populated ones.

Audit question: is there exactly one clear primary emphasis per view?

## Law of Proximity: distance is read as meaning

Elements close together are perceived as related. Users read spatial relationships as semantic relationships, so wrong spacing tells users lies they act on.

What breaks it: a label equidistant between two fields, Save and Cancel far from the form they act on, timestamps sitting closer to the wrong content block, section headers hugging the previous section instead of the one they introduce, and validation errors rendered far from the field that produced them.

What applies it well: tight spacing within groups and loose spacing between them, action buttons directly beside the content they act on, error and helper text immediately below their input, and navigation grouped by workflow rather than alphabetically.

Audit question: does every label, action, and piece of metadata sit closer to what it belongs to than to what it does not?

## Law of Common Region: boundaries create groups

Elements inside a clearly defined boundary are perceived as a group, regardless of proximity. Users build their mental map of an interface from its visual containers.

What breaks it: cards with inconsistent borders or backgrounds, dense tables with no row separation, modals with no backdrop or elevation to separate them from the page, and dropdowns that blend into the surface beneath them.

What applies it well: card borders or background tints that create clean contained regions, row borders or alternating shading in data tables, proper modal backdrops, and sidebars separated from content by a single border rather than a different background colour - a different background fragments the product into what feels like two separate applications.

Audit question: are the visual containers creating the groupings you intend, and are there implied groupings the interface fails to contain?

## How to use UX laws in a design review

The laws work best as a routing table for symptoms:

| Symptom | Check first |
|---------|-------------|
| Interaction feels slow | Doherty Threshold - is feedback over 400ms? |
| Actions feel hard to click | Fitts' Law - are hit areas at least 24px, ideally 44px on touch? |
| Screen feels cluttered | Miller's Law - too many ungrouped items? |
| Users can't find the primary action | Von Restorff - is anything actually isolated? |
| Users click the wrong thing | Proximity and Common Region - is spacing or containment lying? |
| Users stall at a decision | Hick's Law - too many equal choices? |

This routing is built into the free [`/crisp-ux-laws` skill](/skills/crisp-ux-laws), which checks a component or flow against all seven laws and outputs a violations table with a specific fix per row. It pairs with the [30-second AI design review](/tutorials/ai-design-review) for grading whole screens, and with the [UI microcopy guide](/tutorials/ui-microcopy-guide) for the words inside the components.

## FAQ

### Are UX laws actually scientific?

The core laws are, yes. Fitts' Law and Hick's Law come from peer-reviewed experimental psychology in the 1950s and have been replicated across devices for seventy years. Miller's paper on working memory is one of the most cited in psychology. The Gestalt principles date to the 1920s. What varies is how carefully designers translate the lab finding into an interface rule, which is why each law here states its violation patterns concretely.

### Which UX law is most commonly violated?

In practice, the Doherty Threshold. Most product teams ship interactions that wait on a network round-trip before showing anything, which puts routine actions like filtering and tab-switching well over 400ms. It is also the cheapest to fix at the pattern level: optimistic updates, debounced search, and local filtering solve most violations without redesigning anything visual.

### How many UX laws should I actually memorise?

Seven covers the overwhelming majority of real interface problems: Fitts, Hick, Miller, Doherty, Von Restorff, Proximity, and Common Region. More exist, but they largely elaborate these. It matters more to know the symptom-to-law routing - slow means Doherty, cluttered means Miller, unfindable means Von Restorff - than to recite definitions.

### Can I check a design against UX laws automatically?

Yes, if the design exists as code or a detailed artefact. An AI review can measure hit areas against Fitts' thresholds, count choices at decision points for Hick, check grouping and spacing for Proximity and Common Region, and trace whether interactions give feedback within the Doherty window. The `/crisp-ux-laws` skill does exactly this and cites the specific component and fix for each violation it finds.

---

*Publish checklist: validate Article + FAQPage schema, confirm canonical, OG image 1200x630 WebP, add internal link from an existing high-traffic page.*

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "UX Laws: The 7 Rules That Decide Whether Your Interface Works",
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
        { "@type": "Question", "name": "Are UX laws actually scientific?", "acceptedAnswer": { "@type": "Answer", "text": "The core laws come from peer-reviewed experimental psychology: Fitts and Hick in the 1950s, Miller's working memory research, and the Gestalt principles from the 1920s. They have been replicated across devices for decades." } },
        { "@type": "Question", "name": "Which UX law is most commonly violated?", "acceptedAnswer": { "@type": "Answer", "text": "The Doherty Threshold. Most teams ship interactions that wait on a network round-trip, putting routine actions over 400ms. Optimistic updates, debounced search, and local filtering fix most violations without visual redesign." } },
        { "@type": "Question", "name": "How many UX laws should I memorise?", "acceptedAnswer": { "@type": "Answer", "text": "Seven cover most real interface problems: Fitts, Hick, Miller, Doherty, Von Restorff, Proximity, and Common Region. Knowing the symptom-to-law routing matters more than reciting definitions." } },
        { "@type": "Question", "name": "Can I check a design against UX laws automatically?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, when the design exists as code. An AI review can measure hit areas, count choices, check grouping and spacing, and trace feedback timing. The /crisp-ux-laws skill does this and cites the specific component and fix per violation." } }
      ]
    }
  ]
}
```
