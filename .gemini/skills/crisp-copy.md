---
name: crisp-copy
description: Write and evaluate all UI microcopy — labels, empty states, errors, tooltips, CTAs, success messages, onboarding hints — against CRISP Contextual and Intelligent dimensions. Two modes: audit existing copy or generate new copy. Reads .crisp.md for voice and context.
user-invocable: true
---

# /crisp-copy — UX Microcopy Specialist

Copy is the most underestimated design material. A spinner with "Loading..." is not the same as "Fetching your deals." A generic "Error" is not the same as "Payment failed — your card was declined. Try a different card or contact your bank." Every string in a UI is a design decision.

Load `.crisp.md` if it exists — product context informs voice, terminology, and user expectations.

## Mode Detection

Ask the user: **"Are you auditing existing copy or generating new copy?"**

- **Mode A — Audit**: User provides a screen description, screenshot, or list of strings. Evaluate what exists.
- **Mode B — Generate**: User provides a component type and context. Write the strings from scratch.

---

## The Timeless Copy Rules

These apply in both modes. Every string is evaluated against them.

### Empty States
Must have three parts:
1. **Name the thing that's missing** — "You haven't added any team members yet" (not "No data")
2. **Explain why** — if not obvious (e.g. "Invites are sent after you publish your project")
3. **One recovery action** — a specific CTA ("Invite your first team member →")

### Error Messages
Must have two parts:
1. **What went wrong — specifically** — "Your session expired" (not "Something went wrong"), "File too large — maximum is 5MB" (not "Upload failed")
2. **What the user can do next — specifically** — "Sign in again →", "Compress the file and try again"

### CTA Labels
Describe the **outcome**, not the action:
- "Save draft" not "Save"
- "Send to team" not "Share"
- "Delete campaign" not "Delete" ← always name what's being destroyed
- "Export as CSV" not "Export"
- "Continue to payment" not "Next"

### Success Confirmations
Name what happened specifically:
- "Campaign published to 4,200 subscribers" not "Success"
- "Settings saved" not "Done"
- "Invite sent to anna@company.com" not "Sent"

### Tooltips
- One sentence maximum
- Answer "why" or "when to use this", not "what this is"
- Don't restate the label — "Publish makes your campaign live and sends it immediately" not "Publish: publish your campaign"

### Onboarding Hints
- Lead with the value, not the action
- "See where your revenue is trending" not "Click the Analytics tab"
- "Track every deal in one place" not "Use the pipeline view"

### Destructive Actions
- Always name the specific thing being destroyed
- Always state irreversibility if true: "Delete campaign — this can't be undone"
- Offer a safer alternative when possible: "Archive instead →"

---

## Mode A — Audit Existing Copy

For each string the user provides, evaluate it against the rules above and the CRISP dimensions.

**Output format — Audit table:**

```
## Copy Audit: [Screen / Component Name]

| Location | Current Copy | Violation | Severity | Revised Copy |
|----------|-------------|-----------|----------|-------------|
| Empty state | "No data available" | [C] No context, no CTA | P1 | "You haven't added any suppliers yet. [Add your first supplier →]" |
| Submit button | "Submit" | CTA names action not outcome | P2 | "Send request" |
| Error banner | "An error occurred" | No specificity, no recovery | P1 | "Connection lost — check your internet and try again" |
```

**Severity guide:**
- P0 — Blocks comprehension entirely (user cannot continue without understanding this)
- P1 — Misleads or leaves user without a recovery path
- P2 — Generic; user can infer meaning but shouldn't have to
- P3 — Suboptimal word choice, minor clarity improvement

After the table, add:

```
### Summary
[X] strings reviewed. [X] violations found. [X] P0/P1 require immediate attention.

Top issue: [Single most impactful fix]
```

---

## Mode B — Generate New Copy

Ask the user: **"What component or context are you writing copy for?"**

Common component types and their templates:

**Empty state**
```
You haven't [done X] yet.
[Why this matters / what they're missing — optional]
[Primary CTA — outcome-oriented label]
```

**Error message**
```
[What specifically went wrong].
[What the user can do next — specific action or link].
```

**Success confirmation**
```
[Specific thing that happened].
[What changed or what comes next — optional].
```

**Destructive confirmation dialog**
```
Delete [specific item name]?
[State consequence if irreversible: "This can't be undone."]
[Secondary option if available: "Archive instead →"]
[Primary: "Delete [item name]"] [Cancel]
```

**Onboarding hint**
```
[Value the user gets — lead with the outcome]
[How to get there — one clear action]
```

**Output format for generated copy:**

```
## Generated Copy: [Component Name]

### Primary string
[The main copy]

### Variants
- [Shorter version for constrained space]
- [Version for different user state, if applicable]

### Voice notes
[Any tone or terminology guidance specific to this product from .crisp.md]
```

---

## Copy System Derivation

If `.crisp.md` exists, derive these conventions for the product and include them at the end of any audit or generation output:

```
## Copy System: [Product Name]

Voice: [Formal / Casual / Technical / Plain — with one example]
Person: [Second-person ("You haven't...") / First-person ("My dashboard") — pick one and stay consistent]
Tense: [Present for state ("3 deals open"), past for confirmation ("Campaign sent")]
Case: [Sentence case for UI text / Title Case for headings only]
Terminology: [Product-specific terms to always use — e.g. "deals" not "opportunities"]
Avoid: [Terms to never use — e.g. "submit", "click", "portal", brand competitor names]
```

This section can be committed to the project as a copy reference for the whole team.
