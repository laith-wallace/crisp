---
status: draft
primary_keyword: "WCAG 2.2 checklist"
slug: /tutorials/wcag-2-2-checklist
canonical: https://getcrisp.design/tutorials/wcag-2-2-checklist
meta_title: "WCAG 2.2 Checklist: Every AA Criterion for UI | CRISP"  # 54 chars
meta_description: "Free WCAG 2.2 checklist covering all AA criteria for product UI, including the 5 new 2.2 rules. Audit your app in minutes."  # 122 chars
og_image: TODO 1200x630 (original diagram: the 4 POUR principles as a grid)
video: planned (Laith recording)
internal_links: /tutorials/ai-design-review, /tutorials/ux-laws-for-interface-design, /skills/crisp-a11y
source_skill: skills/crisp-a11y.md v1.1.0
---

# WCAG 2.2 Checklist: Every AA Criterion That Applies to Product UI

A WCAG 2.2 checklist is a criterion-by-criterion list you audit your interface against to meet Level AA accessibility compliance. WCAG 2.2 added five new AA criteria covering focus visibility, dragging, target size, consistent help, and accessible login. This checklist covers every criterion that governs product UI, with exact fixes for each.

> **TL;DR**
> WCAG 2.2 is the current accessibility standard. To pass Level AA for a product UI you need to satisfy roughly 24 criteria across four principles: Perceivable, Operable, Understandable, and Robust. Five criteria are new in 2.2. This page is a complete, copy-paste checklist with code-level fixes, and you can automate the whole audit with the free `/crisp-a11y` skill.

**Author:** Laith Wallace - designer-engineer and author of the CRISP design skill pack.
**Last updated:** 6 August 2026

## What is WCAG 2.2?

> **Definition:** WCAG 2.2 (Web Content Accessibility Guidelines, version 2.2) is the W3C standard that defines how to make web interfaces usable by people with disabilities. It became a W3C Recommendation in October 2023. Conformance is measured at three levels: A, AA, and AAA. Level AA is the level most laws and contracts reference, including the European Accessibility Act and most public-sector requirements.

WCAG organises its success criteria under four principles, remembered by the acronym POUR: content must be **Perceivable**, **Operable**, **Understandable**, and **Robust**. Each criterion is a testable pass-or-fail statement, which is what makes a checklist approach work - you are not judging vibes, you are counting failures.

Full spec: [W3C WCAG 2.2 Recommendation](https://www.w3.org/TR/WCAG22/). Quick reference: [W3C How to Meet WCAG](https://www.w3.org/WAI/WCAG22/quickref/).

## What's new in WCAG 2.2: the five new AA criteria

If your product already passed WCAG 2.1 AA, these five criteria are the gap you need to close. They target patterns that modern product UI gets wrong constantly: sticky headers, drag-to-reorder, tiny icon buttons, wandering help widgets, and hostile login forms.

| Criterion | What it requires | Common fix |
|-----------|------------------|------------|
| 2.4.11 Focus Not Obscured (Minimum) | A keyboard-focused element is never fully hidden behind sticky headers, footers, or cookie banners | `scroll-padding-top: 80px` on the scroll container when a sticky header is present |
| 2.5.7 Dragging Movements | Any drag action (sliders, reorder lists, kanban cards) has a single-pointer alternative | "Move up / Move down" buttons alongside drag handles |
| 2.5.8 Target Size (Minimum) | Interactive targets are at least 24x24 CSS pixels | Add padding to icon buttons; 24px is the floor, aim for 44px on touch |
| 3.2.6 Consistent Help | Help mechanisms (contact link, chat widget, FAQ) appear in the same relative location on every page | Pin the help entry point to one consistent position site-wide |
| 3.3.7 Redundant Entry | Information already provided in the same process is auto-populated, not re-typed | A "Same as shipping" checkbox instead of asking for the address twice |

There is a sixth new criterion, 3.3.8 Accessible Authentication (Minimum), which is easy to summarise: login must not require a cognitive test without an alternative. Password fields must allow paste and password managers. Never set `onpaste="return false"` on a credential field. Magic links and passkeys pass automatically.

## Perceivable: can every user detect the content?

Work through these in order. Each item is binary - it passes or it fails.

- **1.1.1 Non-text content.** Every informative image has descriptive `alt` text. Decorative images have `alt=""`. Icon-only buttons have an accessible name: `<button><svg aria-hidden="true" /><span class="sr-only">Close dialog</span></button>`.
- **1.3.1 Info and relationships.** Headings use real `<h1>` to `<h6>` elements, not styled divs. Every form field has an associated `<label>`. Lists use `<ul>`, `<ol>`, or `<dl>`. Table headers use `<th>` with a `scope` attribute.
- **1.3.3 Sensory characteristics.** Instructions never rely only on shape, colour, or position. "Click the green button" fails. "Click the Save button" passes.
- **1.4.1 Use of colour.** Meaning is never carried by colour alone. Error states pair the red with an icon or text label.
- **1.4.3 Contrast (minimum).** Body text needs a 4.5:1 contrast ratio; large text (18pt and up, or 14pt bold) needs 3:1. Compute the real ratio from your design tokens rather than eyeballing it. For design work beyond the compliance floor, [APCA](https://apcacontrast.com/) is more perceptually accurate than the WCAG 2 ratio.
- **1.4.4 Resize text.** The page stays functional at 200% browser zoom with no horizontal scrolling.
- **1.4.11 Non-text contrast.** Input borders, button outlines, focus rings, and informative icons all hit 3:1 against their background.
- **1.4.13 Content on hover or focus.** Tooltips can be dismissed with Esc without moving the pointer, and they do not vanish when the pointer moves onto them.

## Operable: can every user drive the interface?

- **2.1.1 Keyboard.** Everything works with only a keyboard, including custom dropdowns, date pickers, tabs, and modals. Modal focus is trapped so Tab cannot reach the page behind it.
- **2.1.2 No keyboard trap.** The user can always leave any component with Tab, Shift+Tab, or Esc.
- **2.4.3 Focus order.** Focus moves in reading order, and when a modal closes, focus returns to the element that opened it.
- **2.4.4 Link purpose.** Link text describes its destination on its own. "Click here" and "Read more" fail. "View campaign report" passes.
- **2.4.7 Focus visible.** Every interactive element shows a visible focus indicator. `outline: none` with no replacement is an automatic failure.
- **2.5.3 Label in name.** A button's accessible name contains its visible label. A button labelled "Delete" with `aria-label="Remove item"` fails, because voice-control users say what they see.
- **2.4.11, 2.5.7, 2.5.8** - the three new Operable criteria covered in the table above: focus never fully obscured, drag actions have alternatives, targets are at least 24x24px.

## Understandable: can every user predict and recover?

- **3.3.1 Error identification.** Errors are described in text, and each message names the specific field and what to do about it.
- **3.3.2 Labels or instructions.** Every field has an always-visible label. Placeholder-only labels fail because placeholders disappear the moment the user starts typing. Required fields are marked in text, not only with colour.
- **3.3.3 Error suggestion.** Messages suggest the fix. "Invalid email" fails. "Enter a valid email address like name@company.com" passes.
- **3.2.6 Consistent Help and 3.3.7 Redundant Entry** - new in 2.2, covered above.
- **3.3.8 Accessible authentication.** No cognitive test at login without an alternative; paste and password managers always allowed.

## Robust: does assistive technology get the full picture?

- **4.1.2 Name, role, value.** Every interactive element has an accessible name. Custom controls expose a role (`role="button"`, `role="dialog"`) and communicate state programmatically: `aria-expanded`, `aria-checked`, `aria-selected`.
- **4.1.3 Status messages.** Success, error, and loading announcements reach screen readers without stealing focus. Use `role="status"` with `aria-live="polite"` for confirmations and `role="alert"` for errors: `<div role="status" aria-live="polite">Changes saved</div>`.

One principle sits underneath all of Robust: **semantics before ARIA**. A native `<button>` is focusable, keyboard-operable, and correctly announced with zero extra code. A `<div role="button">` needs `tabindex`, keyboard handlers, and ARIA to badly imitate it. When you find a div acting as a control, the fix is almost always to replace the element, not to patch it with ARIA.

## How to prioritise fixes: the P0 to P3 severity scale

Not every failure is equal, and a flat list of violations stalls teams. Rate each failure by user impact:

| Priority | Definition |
|----------|-----------|
| P0 | Completely blocks an assistive technology user - a screen reader user cannot complete the task, or a keyboard user is trapped |
| P1 | Major barrier - the task is technically completable but with significant difficulty |
| P2 | Noticeable degradation the user can work around |
| P3 | Polish, not a blocker |

Fix P0s before shipping, schedule P1s this sprint, and backlog the rest. A missing accessible name on a Close button is a P0. A 20x20px toolbar icon is a P2.

## Run this checklist automatically with /crisp-a11y

Working through 24 criteria by hand takes an afternoon. The free [`/crisp-a11y` skill](/skills/crisp-a11y) runs the entire audit against your actual codebase in one command: it reads your markup, computes contrast from your real design tokens, traces keyboard handlers, cites file and line for every failure, and outputs the violations table plus a portable `a11y-checklist.md` your team can commit. Install the CRISP skill pack, open your project, and run `/crisp-a11y`.

For a faster general-purpose design check, see the [AI design review tutorial](/tutorials/ai-design-review). For the perceptual science behind why target size and grouping matter, see [UX laws for interface design](/tutorials/ux-laws-for-interface-design).

## FAQ

### What is the difference between WCAG 2.1 and WCAG 2.2?

WCAG 2.2 adds nine success criteria on top of WCAG 2.1 and removes one (4.1.1 Parsing, now obsolete). For Level AA product work, the practical difference is five new criteria: focus not obscured, dragging alternatives, minimum target size, consistent help placement, and redundant entry, plus accessible authentication. Everything that passed 2.1 AA still passes in 2.2 except sites relying on the removed parsing criterion.

### Is WCAG 2.2 Level AA legally required?

It depends on your jurisdiction and sector, but AA is the level regulations converge on. The European Accessibility Act, which applies to most consumer-facing digital products sold in the EU from June 2025, references EN 301 549, which tracks WCAG. In the US, ADA lawsuits and Section 508 both lean on WCAG AA. Treating AA as the floor is the safe commercial position.

### What are the most common WCAG failures in product UI?

The failures that appear in almost every audit are missing accessible names on icon buttons, placeholder-only form labels, body text below the 4.5:1 contrast ratio, custom dropdowns that keyboard users cannot operate, and suppressed focus outlines. All five are quick to fix, and the first four are P0 or P1 severity because they block or badly hinder assistive technology users.

### Can accessibility audits be automated?

Partially, and more than most teams assume. Contrast ratios, missing alt text, missing labels, target sizes, and ARIA state can all be checked against code automatically. What still needs judgement is whether alt text is meaningful, whether focus order matches visual logic, and whether error messages actually help. The `/crisp-a11y` skill combines both: automated checks against your real tokens and markup, plus reasoned evaluation with a cited file and line for every finding.

### How long does a WCAG 2.2 audit take?

By hand, a single screen takes one to three hours if you test keyboard flows and compute contrast properly, and a full product takes days. With code access and an automated pass doing the mechanical checks, a component-level audit compresses to minutes, leaving human time for the judgement calls. Audit one high-traffic flow first rather than boiling the whole product.

---

*Publish checklist: validate Article + FAQPage schema, confirm canonical, OG image 1200x630 WebP, add internal link from an existing high-traffic page.*

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "WCAG 2.2 Checklist: Every AA Criterion That Applies to Product UI",
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
        { "@type": "Question", "name": "What is the difference between WCAG 2.1 and WCAG 2.2?", "acceptedAnswer": { "@type": "Answer", "text": "WCAG 2.2 adds nine success criteria on top of WCAG 2.1 and removes the obsolete 4.1.1 Parsing criterion. For Level AA product work the practical difference is five new criteria: focus not obscured, dragging alternatives, minimum target size, consistent help placement, and redundant entry, plus accessible authentication." } },
        { "@type": "Question", "name": "Is WCAG 2.2 Level AA legally required?", "acceptedAnswer": { "@type": "Answer", "text": "AA is the level regulations converge on. The European Accessibility Act references EN 301 549, which tracks WCAG, and US ADA cases and Section 508 lean on WCAG AA. Treating AA as the floor is the safe commercial position." } },
        { "@type": "Question", "name": "What are the most common WCAG failures in product UI?", "acceptedAnswer": { "@type": "Answer", "text": "Missing accessible names on icon buttons, placeholder-only form labels, low-contrast body text, keyboard-inoperable custom dropdowns, and suppressed focus outlines. All are quick to fix and most are P0 or P1 severity." } },
        { "@type": "Question", "name": "Can accessibility audits be automated?", "acceptedAnswer": { "@type": "Answer", "text": "Partially. Contrast, alt text, labels, target sizes, and ARIA state can be checked against code automatically. Judgement is still needed for meaningful alt text, focus order logic, and error message quality. The /crisp-a11y skill combines automated checks with reasoned evaluation and cites file and line for every finding." } },
        { "@type": "Question", "name": "How long does a WCAG 2.2 audit take?", "acceptedAnswer": { "@type": "Answer", "text": "By hand, one to three hours per screen. With code access and automation handling the mechanical checks, a component-level audit compresses to minutes. Audit one high-traffic flow first rather than the whole product at once." } }
      ]
    }
  ]
}
```
