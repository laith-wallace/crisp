---
name: crisp-a11y
description: WCAG 2.2 AA accessibility evaluation of product UI, including all five new 2.2 criteria - P0-P3 severity, code-level remediation, and a portable a11y-checklist.md. Use for accessibility or WCAG compliance reviews, or whenever the user mentions screen readers, keyboard navigation, or contrast.
user-invocable: true
version: "1.1.0"
---

# /crisp-a11y - Accessibility Deep Audit

`CRISP + a11y` extension. This goes four times deeper than the accessibility section in `/handoff` - covering the WCAG 2.2 AA success criteria that govern product UI (including all five criteria new in 2.2) with exact, code-level fixes, not generic direction. Criteria that apply only to media, timing, or full-document structure are out of scope here; flag them for manual review when the surface involves video, audio, or time limits.

Load `.crisp.md` if it exists - design system tokens inform contrast analysis. Note any existing `Extensions: CRISP + a11y` flag.

## Setup

Infer before asking. If the request names the component, or a codebase is available, determine the target, interaction type, and token values yourself - read the component code, find the design tokens in CSS/theme files, and declare what you found. Ask only what you cannot infer:

1. "What component or screen are you auditing?" - only if no target is evident
2. "What's the primary interaction type?" - Form / Navigation / Data display / Modal / Custom control / Content page - only if not evident from the target
3. "Do you have token values available?" (e.g. `--color-text-primary: #1a1a1a`) - only if no codebase is available; when one is, extract them yourself

## Evidence Before Judgement

When a codebase is available, verify every criterion against the actual code - do not judge from a description. Read the markup, compute contrast from real token values, trace keyboard handlers, and check focus management in the code. Cite file and line for every failure. A failure without a citation is an impression, not a finding.

---

## WCAG 2.2 AA Evaluation Criteria

Evaluate each applicable criterion. Mark as **Pass**, **Fail**, or **N/A** (not applicable to this component).

For every **Fail**, provide:
- The exact violation (not "missing alt text" - "the `<img>` on line 47 has no `alt` attribute")
- A severity rating (P0–P3)
- An exact fix - code snippet or design instruction precise enough to implement without guesswork

---

### Perceivable

**1.1.1 Non-text Content** (images, icons, decorative elements)
- All images conveying information have descriptive `alt` text
- Decorative images have `alt=""`
- Icons used as buttons have accessible names via `aria-label` or visually hidden text
- Fix example: `<button><svg aria-hidden="true" /><span class="sr-only">Close dialog</span></button>`

**1.3.1 Info and Relationships** (semantic structure)
- Headings use `<h1>`–`<h6>`, not styled `<div>` or `<span>`
- Form fields have associated `<label>` elements (not just placeholder text)
- Lists use `<ul>` / `<ol>` / `<dl>`, not styled divs
- Tables have `<th>` with `scope` attribute for headers

**1.3.3 Sensory Characteristics**
- Instructions don't rely solely on shape, colour, size, or position
- "Click the green button" fails - "Click the Save button" passes

**1.4.1 Use of Colour**
- Meaning is never conveyed by colour alone
- Error states use an icon or text label, not only red colour
- Status indicators (success/warning/error) have text or icon in addition to colour

**1.4.3 Contrast Minimum**
- Body text (< 18pt normal, < 14pt bold): 4.5:1 minimum ratio
- Large text (≥ 18pt normal, ≥ 14pt bold): 3:1 minimum ratio
- Calculate exact ratio when tokens are available; flag approximate when only colours described
- **Prefer [APCA](https://apcacontrast.com/) over WCAG 2 ratios** - APCA is more perceptually accurate and better reflects how humans actually read text in real interfaces. Use WCAG 2 ratios as the compliance floor when standards require it, but APCA as the design truth.

**1.4.4 Resize Text**
- Page remains functional and readable at 200% browser zoom without horizontal scrolling

**1.4.11 Non-text Contrast**
- UI components (input borders, button outlines, focus indicators): 3:1 minimum against background
- Informational icons: 3:1 minimum

**1.4.13 Content on Hover or Focus**
- Tooltips and hover content can be dismissed without moving the pointer (Esc key)
- Hover content doesn't disappear when the user moves the pointer over it

---

### Operable

**2.1.1 Keyboard**
- All functionality is available using only the keyboard
- Custom components (dropdowns, date pickers, modals, tabs) have keyboard navigation
- Modal focus is trapped - keyboard cannot reach content behind the modal

**2.1.2 No Keyboard Trap**
- User can always navigate away from any component using Tab or Shift+Tab (or Esc for modals)

**2.4.3 Focus Order**
- Focus moves in a logical reading order (left to right, top to bottom)
- After closing a modal, focus returns to the element that triggered it

**2.4.4 Link Purpose**
- Link text describes its destination without surrounding context
- "Click here" and "Read more" fail - "View campaign report" passes

**2.4.7 Focus Visible**
- Every interactive element shows a visible focus indicator when focused via keyboard
- Browser default outline is not suppressed without a replacement (`outline: none` is a red flag)

**2.5.3 Label in Name**
- For buttons and links with visible text, the accessible name starts with or contains the visible label
- A button labelled "Delete" with `aria-label="Remove item"` fails this criterion

**2.4.11 Focus Not Obscured - Minimum (WCAG 2.2 NEW)**
- A focused element is never fully hidden behind sticky headers, footers, cookie banners, or other overlays
- Fix example: `scroll-padding-top: 80px` on the scroll container when a sticky header is present

**2.5.7 Dragging Movements (WCAG 2.2 NEW)**
- Any action that uses dragging (sliders, reorder lists, kanban cards) has a single-pointer alternative that doesn't require dragging
- Fix example: reorder buttons ("Move up / Move down") alongside drag handles

**2.5.8 Target Size - Minimum (WCAG 2.2 NEW)**
- Interactive targets are at least 24×24 CSS pixels
- Exception: inline text links, where spacing around the target satisfies the criterion
- Note: 24×24 is the WCAG compliance floor. The 44×44px value used in `/handoff` is the touch-target recommendation (Apple HIG) - meet 24 to comply, aim for 44 on touch surfaces

---

### Understandable

**3.3.1 Error Identification**
- Errors are identified in text (not only by colour or icon)
- Each error message identifies the specific field and what the user should do

**3.3.2 Labels or Instructions**
- Every form field has a label that is always visible (not only placeholder text - placeholders disappear on input)
- Required fields are explicitly marked (not only with colour)

**3.2.6 Consistent Help (WCAG 2.2 NEW)**
- Help mechanisms (contact link, chat widget, FAQ link) appear in the same relative location on every page where they occur

**3.3.3 Error Suggestion**
- Error messages suggest how to fix the problem when possible
- "Invalid email" fails - "Enter a valid email address like name@company.com" passes

**3.3.7 Redundant Entry (WCAG 2.2 NEW)**
- Information the user already provided in the same process is auto-populated or selectable, not re-typed
- A checkout that asks for the shipping address twice fails; "Same as shipping" passes

**3.3.8 Accessible Authentication - Minimum (WCAG 2.2 NEW)**
- Login does not require a cognitive function test (memorising, transcribing, solving puzzles) without an alternative
- Password fields allow paste and password managers; email/magic-link or passkey alternatives pass
- Fix example: never set `onpaste="return false"` on credential fields

---

### Robust

**4.1.2 Name, Role, Value**
- All interactive elements have an accessible name
- Custom controls expose their role via ARIA (`role="button"`, `role="dialog"`, etc.)
- State is communicated programmatically: `aria-expanded`, `aria-checked`, `aria-selected`, `aria-disabled`
- Fix example: `<div role="button" aria-expanded="false" tabindex="0">Menu</div>`

**4.1.3 Status Messages**
- Status messages (success, error, loading) are announced to screen readers without receiving focus
- Use `role="status"` (polite) for success/info, `role="alert"` (assertive) for errors
- Fix example: `<div role="status" aria-live="polite">Changes saved</div>`

---

### Principle: Semantics Before ARIA

Prefer native HTML elements over ARIA attributes. A native `<button>` is keyboard-accessible, focusable, and carries the correct role with no extra code. A `<div role="button">` requires explicit `tabindex`, `role`, and keyboard handlers to replicate what the browser provides for free.

Order of preference:
1. Native HTML element (`<button>`, `<a>`, `<label>`, `<select>`, `<table>`)
2. Native element with ARIA state (`<button aria-expanded="true">`)
3. Non-semantic element with full ARIA and keyboard handling - only when no native element is appropriate

Flag any `<div>` or `<span>` acting as an interactive control. The fix is almost always to replace it with the correct native element, not to ARIA-patch it.

---

## Severity Rating

| Priority | Definition |
|----------|-----------|
| P0 | Completely blocks an assistive technology user - screen reader user cannot complete the task, keyboard-only user is trapped |
| P1 | Major barrier - assistive technology user can technically complete the task but with significant difficulty |
| P2 | Noticeable degradation - impacts experience but user can work around it |
| P3 | Minor issue - polish, not a blocker |

---

## Output Format

```
## Accessibility Audit: [Component / Screen Name]

**WCAG 2.2 AA Compliance: [Pass / Fail / Partial]**
[X] criteria evaluated | [X] failures | [X] P0–P1 blockers

---

### Violations

| Criterion | Status | Severity | Violation | Fix |
|-----------|--------|----------|-----------|-----|
| 1.4.3 Contrast | FAIL | P1 | Button label "#6B7280 on #FFFFFF" = 4.0:1 (needs 4.5:1) | Change to `color: #4B5563` = 5.5:1 |
| 2.1.1 Keyboard | FAIL | P0 | Custom dropdown not keyboard-navigable | Add `role="listbox"`, `role="option"`, Arrow key / Enter / Esc handlers |
| 4.1.2 Name, Role | FAIL | P0 | Close button has no accessible name | Add `aria-label="Close dialog"` or `<span class="sr-only">Close</span>` |
| 2.5.8 Target Size | FAIL | P2 | Icon buttons in toolbar are 20×20px | Increase to minimum 24×24px |
| 1.1.1 Alt Text | PASS | - | - | - |

---

### P0 Blockers (fix before shipping)
[List P0 items with exact fixes]

### P1 Fixes (this sprint)
[List P1 items with exact fixes]

### P2–P3 Backlog
[List lower-priority items]
```

---

## Portable Checklist Output

After the violation table, generate a `a11y-checklist.md` the team can commit:

```markdown
# Accessibility Checklist: [Component / Screen Name]
*Generated by /crisp-a11y - WCAG 2.2 AA*
*Last audited: [date]*

## Perceivable
- [ ] All non-decorative images have descriptive alt text
- [ ] Decorative images have alt=""
- [ ] Icon buttons have aria-label or sr-only text
- [ ] Form labels are always visible (not only placeholder)
- [ ] Error states use text/icon, not only colour
- [ ] Body text contrast ≥ 4.5:1
- [ ] Large text contrast ≥ 3:1
- [ ] UI component contrast ≥ 3:1 (borders, icons)
- [ ] Page usable at 200% browser zoom

## Operable
- [ ] All functions accessible by keyboard
- [ ] Modal focus is trapped; Esc closes modal; focus returns to trigger on close
- [ ] Focus order is logical (top-to-bottom, left-to-right)
- [ ] Link text describes destination without surrounding context
- [ ] Focus indicator visible on all interactive elements
- [ ] Focused elements never fully obscured by sticky UI (WCAG 2.2)
- [ ] Drag interactions have a non-drag alternative (WCAG 2.2)
- [ ] Interactive targets ≥ 24×24px (WCAG 2.2)

## Understandable
- [ ] Error messages name the field and suggest a fix
- [ ] Required fields are marked in text (not only colour)
- [ ] Help mechanisms appear in a consistent location across pages (WCAG 2.2)
- [ ] No re-typing of information already provided in the same flow (WCAG 2.2)
- [ ] Login allows paste/password managers; no cognitive test without alternative (WCAG 2.2)

## Robust
- [ ] Custom controls expose role, name, and state via ARIA
- [ ] Status messages use role="status" or role="alert"
- [ ] No functionality relies on colour alone to convey meaning
```

Suggest the user commit `a11y-checklist.md` to `docs/design/` or `docs/a11y/` so it becomes part of the project's definition of done.
