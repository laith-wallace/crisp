---
name: handoff
description: Convert a CRISP-reviewed design into a developer-ready specification. Produces component states, implementation notes, token references, edge cases, and an accessibility checklist. Use after a design has passed /crisp-audit or /crisp-review. If .crisp.md exists, load it first.
user-invocable: true
---

# /handoff — Developer Handoff Spec

Convert a design into a complete, implementation-ready specification. The goal is to eliminate ambiguity before a single line of code is written.

If `.crisp.md` exists, load it. Your spec should reference the documented design system tokens and constraints.

## What to Produce

A handoff spec that covers everything a developer needs to build the design correctly, without having to interpret, invent, or ask follow-up questions.

---

## Section 1: Overview

```
## [Component / Screen Name] — Handoff Spec
Date: [Today]
Status: Ready for development

### Summary
[One paragraph: what this is, what it does, who uses it]

### Scope
[What's included in this spec]
[What's explicitly out of scope]
```

---

## Section 2: Component Inventory

List every distinct component in the design:

```
### Components

| Component | Type | Existing / New | Notes |
|-----------|------|---------------|-------|
| [Name]    | [Button / Card / Modal / etc.] | [Existing — link to design system] / [New] | [Any notes] |
```

For new components only, add:
- **Props**: What data does it accept?
- **Variants**: What visual/functional variants exist?
- **Behaviour**: How does it respond to interactions?

---

## Section 3: States

For every interactive element and every screen, document all states:

```
### States: [Component/Screen Name]

**Default**
[Description of the resting state]

**Hover / Focus**
[Description — include cursor, outline, colour change]

**Active / Pressed**
[Description]

**Loading**
[Description — skeleton, spinner, optimistic UI? Which and why]

**Empty**
[What the user sees when there's no data — never "No data available"]

**Error**
[What the user sees when something goes wrong — specific error message, recovery action]

**Disabled**
[When is it disabled? What does it look like? Can the user tell why?]

**Success**
[What confirms the action completed — and what did it do specifically?]
```

---

## Section 4: Tokens & Spacing

Reference the design system from `.crisp.md` or document the values directly:

```
### Design Tokens

**Colours**
| Token | Value | Usage |
|-------|-------|-------|
| [name] | [value] | [where used in this component] |

**Typography**
| Token | Size | Weight | Line-height | Usage |
|-------|------|--------|-------------|-------|

**Spacing**
| Context | Value | Token |
|---------|-------|-------|
| Internal padding | [value] | [token name] |
| Gap between elements | [value] | [token name] |

**Border / Radius**
[Document radius values and border styles used]
```

---

## Section 5: Interactions & Animation

```
### Interactions

| Trigger | Action | Duration | Easing | Notes |
|---------|--------|----------|--------|-------|
| Button click | Optimistic state update | immediate | — | Don't wait for API |
| Hover on card | Background colour shift | 150ms | ease-out | |
| Modal open | Fade + scale from 95% | 200ms | ease-out | |
```

---

## Section 6: Edge Cases

Document the cases that aren't shown in the main design but must be handled:

```
### Edge Cases

| Scenario | Expected behaviour |
|----------|-------------------|
| User has no data yet | [Empty state with CTA — exact copy] |
| API returns error | [Error message — exact copy + recovery action] |
| User has 1 item | [Singular vs. plural label handling] |
| User has 1,000+ items | [Truncation / pagination behaviour] |
| Long text / content | [How labels, headings, descriptions handle overflow] |
| Slow connection | [Loading state — duration before skeleton appears] |
| User lacks permission | [What they see — not a blank page] |
```

---

## Section 7: Accessibility

```
### Accessibility Checklist

**Keyboard**
- [ ] All interactive elements reachable via Tab
- [ ] Focus order matches visual order
- [ ] Custom components have keyboard equivalents (Escape to close, Enter to confirm)
- [ ] Focus is managed correctly after modal open/close

**Screen reader**
- [ ] All interactive elements have accessible labels (aria-label or visible text)
- [ ] Icons without text have aria-hidden="true" or aria-label
- [ ] Dynamic content updates announced via aria-live
- [ ] Error messages associated with form fields via aria-describedby

**Visual**
- [ ] Text contrast meets WCAG AA (4.5:1 for body, 3:1 for large text)
- [ ] UI doesn't rely on colour alone to convey meaning
- [ ] Touch targets are minimum 44×44px
- [ ] Focus indicator is visible and has 3:1 contrast against background

**Specific to this component**
[Any component-specific accessibility considerations]
```

---

## Section 8: Copy

Document every string that appears in this design:

```
### Copy

| Location | String | Notes |
|----------|--------|-------|
| Page heading | "[exact copy]" | [Tone note if relevant] |
| CTA button | "[exact copy]" | |
| Empty state heading | "[exact copy]" | |
| Empty state body | "[exact copy]" | |
| Success message | "[exact copy]" | |
| Error message | "[exact copy]" | [What error condition triggers this] |
```

---

## Section 9: Open Questions

```
### Open Questions for Engineering
- [Technical questions the developer needs answered before building]

### Open Questions for Product
- [Product decisions still outstanding]

### Decisions Made
- [Key decisions already resolved — document so there's no revisiting]
```

---

## Handoff Style

- Be precise. "Fade in" is not enough. "Opacity 0→1, 200ms, ease-out" is.
- Every string should be exact. No "TBD" in copy.
- Every error state needs a recovery action, not just an error message.
- If a state isn't documented, a developer will invent it. That's a design decision you've abdicated.
