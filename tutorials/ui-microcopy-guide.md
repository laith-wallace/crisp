---
status: draft
primary_keyword: "UI microcopy"
slug: /tutorials/ui-microcopy-guide
canonical: https://getcrisp.design/tutorials/ui-microcopy-guide
meta_title: "UI Microcopy: Labels, Errors & Empty States | CRISP"  # 51 chars
meta_description: "Write UI microcopy that works: error messages, empty states, CTA labels and tooltips, with before-and-after examples and a self-audit checklist."  # 144 chars
og_image: TODO 1200x630 (original diagram: weak vs strong copy side-by-side)
video: planned (Laith recording)
internal_links: /tutorials/ai-design-review, /tutorials/wcag-2-2-checklist, /skills/crisp-copy
source_skill: skills/crisp-copy.md v1.1.0
---

# UI Microcopy: How to Write Labels, Errors, and Empty States That Actually Help

UI microcopy is the short text inside an interface: button labels, error messages, empty states, tooltips, confirmations, and onboarding hints. Good microcopy names what specifically happened and what the user can do next. "Payment failed - your card was declined. Try a different card" works; "Something went wrong" never does.

> **TL;DR**
> Every string in a UI is a design decision. This guide gives you the timeless rules: empty states need three parts, error messages need two, CTAs describe outcomes not actions, and destructive buttons always name what they destroy. It ends with a 7-point self-audit checklist you can run over any screen, manually or with the free `/crisp-copy` skill.

**Author:** Laith Wallace - designer-engineer and author of the CRISP design skill pack.
**Last updated:** 6 August 2026

## What is UI microcopy?

> **Definition:** Microcopy is the functional text in a product interface, as distinct from marketing copy or documentation. It includes labels, placeholders, error messages, empty states, tooltips, confirmations, and hints. It is the most underestimated design material: a spinner reading "Loading..." and one reading "Fetching your deals" cost the same to build but create different products.

Before writing a single string, identify the register. A **brand surface** (pricing page, landing page) leads with personality; voice is the product. A **product surface** (settings, checkout, dashboard) leads with clarity and recovery; the voice disappears into the task, and clever language at high-stakes moments is a liability. Most microcopy failures are brand voice leaking into product surfaces.

## Empty states: three parts, no exceptions

An empty state that says "No data" wastes the single best onboarding moment in the product. Every empty state needs:

1. **Name the missing thing.** "You haven't added any team members yet" - not "No data available".
2. **Explain why**, if it is not obvious. "Invites are sent after you publish your project."
3. **One recovery action.** A specific CTA: "Invite your first team member".

The first-run empty state is the one screen every single user sees. Write it like it matters, because it does.

## Error messages: what went wrong, and what to do next

Every error message has exactly two jobs, and most ship doing neither:

1. **What went wrong, specifically.** "Your session expired", not "Something went wrong". "File too large - maximum is 5MB", not "Upload failed".
2. **What the user can do next, specifically.** "Sign in again", "Compress the file and try again".

Match the recovery action to the failure type:

| Failure type | What to say | Recovery action |
|---|---|---|
| Session expired | "Your session expired" | "Sign in again" |
| Network | "Connection lost - check your internet" | "Try again" button |
| Permission denied | "You don't have access to [X]" | "Request access" or "Contact your admin" |
| Rate limit | "You've reached the limit" | Clear action with an ETA or upgrade path |
| File or input error | The specific reason plus the constraint | The specific resolution |
| Server error | "Something went wrong on our end" | "Try again" - never expose technical detail |

Two more rules. First, frame errors in a problem-solving tone, not a failure tone - the copy should feel like a hand pointing at the solution, not a finger pointing at the user. Second, never leak stack traces, error codes without explanation, or internal system names; "Something went wrong on our end" is the only acceptable vague error, and only for genuine server faults. Nielsen Norman Group's [error message guidelines](https://www.nngroup.com/articles/error-message-guidelines/) have backed this position for two decades.

Before and after:

| Weak | Strong |
|------|--------|
| "Invalid API key" | "Your API key is incorrect or expired. Generate a new key in your account settings." |
| "Your deployment failed" | "Something went wrong - try again or contact support." |
| "Payment error" | "Your card was declined. Try a different card or contact your bank." |

## CTA labels: describe the outcome, not the mechanism

Generic verbs hide the consequence of clicking. The label should tell the user what will be true after the click:

- "Save draft", not "Save"
- "Send to team", not "Share"
- "Export as CSV", not "Export"
- "Continue to payment", not "Next"
- "Delete campaign", not "Delete" - destructive actions always name the thing being destroyed

This rule also carries an accessibility payoff: outcome-labelled buttons satisfy the link-purpose expectations covered in the [WCAG 2.2 checklist](/tutorials/wcag-2-2-checklist), because the label makes sense out of context to a screen reader user jumping between controls.

## Success confirmations: name what changed

"Success" and "Done" confirm that something happened without saying what. Name it:

- "Campaign published to 4,200 subscribers", not "Success"
- "Settings saved", not "Done"
- "Invite sent to anna@company.com", not "Sent"

Specific confirmations do double duty: they close the loop on the action and they catch mistakes, because a user who meant to invite dana@company.com sees the wrong name immediately.

## Tooltips and onboarding hints: value first, one sentence

Tooltips: one sentence maximum, answering "why" or "when to use this", never restating the label. "Publish makes your campaign live and sends it immediately" earns its pixels; "Publish: publish your campaign" does not.

Onboarding hints: lead with the value, then the action. "See where your revenue is trending" beats "Click the Analytics tab". Users follow instructions when they already want the destination.

## Destructive actions and loading states

Destructive confirmations have a fixed shape. Name the specific item, state irreversibility if true, and offer the safer alternative when one exists:

> Delete "Q3 Launch" campaign?
> This can't be undone.
> [Archive instead] [Delete campaign] [Cancel]

Loading states and menu items that open a follow-up dialog end with the ellipsis character - "Saving…", "Rename…", "Export as…". The ellipsis is a signal that something more is coming; it primes the user and removes the jarring gap between action and result. Use the single "…" character, not three periods. Platform conventions like [Apple's Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/writing) have enforced this convention for decades.

## The 7-point microcopy self-audit

Run this over every string on a screen. Each check is binary - a string passes or it fails:

1. Empty states: all three parts present (names the missing thing, explains why if not obvious, one recovery CTA)?
2. Errors: names the specific failure AND the specific next action?
3. CTAs: describe the outcome, not the mechanism?
4. Destructive actions: name the thing being destroyed, and state irreversibility if true?
5. Success messages: name exactly what changed?
6. Loading and follow-up items: end with the ellipsis character?
7. Zero em dashes, zero exclamation marks, zero "click here" in any string?

The free [`/crisp-copy` skill](/skills/crisp-copy) runs this audit automatically in two modes: paste existing strings and it returns a violations table with severity ratings and rewritten copy, or describe a component and it generates the strings from scratch, matched to your product's voice. For grading the whole screen the copy sits inside, see the [AI design review tutorial](/tutorials/ai-design-review).

## FAQ

### What is the difference between microcopy and UX writing?

UX writing is the discipline; microcopy is the material. A UX writer's output includes microcopy but also content strategy, voice and tone systems, and terminology decisions. Microcopy refers specifically to the short functional strings in the interface: labels, errors, empty states, tooltips, and confirmations. In small teams nobody holds the UX writer title, which is exactly why developers and designers need the rules in this guide.

### Why is "Something went wrong" considered bad microcopy?

Because it gives the user zero information to act on. It does not say what failed, whether their data survived, whether retrying will help, or whom to contact. Users faced with it either retry blindly, abandon the task, or file a support ticket that costs you money. The only acceptable use is a genuine unexpected server fault, phrased as "Something went wrong on our end" with a retry action.

### Should error messages be funny?

Almost never on product surfaces. Humour at a failure moment reads as the product laughing while the user's work is blocked, and it ages badly in high-frequency interfaces. Personality belongs on brand surfaces like landing and pricing pages where stakes are low. On product surfaces the voice should disappear into the task: name the failure, point at the exit.

### How long should a tooltip be?

One sentence. If the explanation needs more, the control needs a better label, inline helper text, or a link to documentation rather than a longer tooltip. A tooltip should answer why or when to use the control, never restate its label, and it must be dismissible with Esc to satisfy WCAG 1.4.13.

---

*Publish checklist: validate Article + FAQPage schema, confirm canonical, OG image 1200x630 WebP, add internal link from an existing high-traffic page.*

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "UI Microcopy: How to Write Labels, Errors, and Empty States That Actually Help",
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
        { "@type": "Question", "name": "What is the difference between microcopy and UX writing?", "acceptedAnswer": { "@type": "Answer", "text": "UX writing is the discipline; microcopy is the material. Microcopy refers to the short functional strings in an interface: labels, errors, empty states, tooltips, and confirmations. UX writing also covers content strategy, voice systems, and terminology." } },
        { "@type": "Question", "name": "Why is 'Something went wrong' considered bad microcopy?", "acceptedAnswer": { "@type": "Answer", "text": "It gives the user nothing to act on: what failed, whether data survived, whether retrying helps. Users retry blindly, abandon, or file support tickets. Its only acceptable use is a genuine server fault phrased as 'Something went wrong on our end' with a retry action." } },
        { "@type": "Question", "name": "Should error messages be funny?", "acceptedAnswer": { "@type": "Answer", "text": "Almost never on product surfaces. Humour at a failure moment reads as the product laughing while the user is blocked. Personality belongs on brand surfaces like landing pages. On product surfaces, name the failure and point at the exit." } },
        { "@type": "Question", "name": "How long should a tooltip be?", "acceptedAnswer": { "@type": "Answer", "text": "One sentence, answering why or when to use the control, never restating the label. If it needs more, the control needs a better label, inline helper text, or a documentation link. Tooltips must be dismissible with Esc to satisfy WCAG 1.4.13." } }
      ]
    }
  ]
}
```
