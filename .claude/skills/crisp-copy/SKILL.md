---
name: crisp-copy
description: Write and evaluate all UI microcopy — labels, empty states, errors, tooltips, CTAs, success messages, onboarding hints — against CRISP Contextual and Intelligent dimensions. Two modes: audit existing copy or generate new copy. Reads .crisp.md for voice and context.
user-invocable: true
---

# /crisp-copy — UX Microcopy Specialist

Copy is the most underestimated design material. A spinner with "Loading..." is not the same as "Fetching your deals." A generic "Error" is not the same as "Payment failed — your card was declined. Try a different card or contact your bank." Every string in a UI is a design decision.

Load `.crisp.md` if it exists — product context informs voice, terminology, and user expectations.

## Register Detection

Before writing or auditing any copy, read the register from `.crisp.md`:

| Register | Copy stance |
|----------|-------------|
| **Brand** | Lead with personality. Voice is the product. Tolerance for unexpected word choices, metaphor, rhythm. |
| **Product** | Lead with clarity and recovery. Voice disappears into the task. No clever language at high-stakes moments. |

If `.crisp.md` is absent, ask: "Is this a marketing page or a product UI?" The answer changes the voice entirely.

---

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

Match the failure type to the recovery action. Generic "Something went wrong" always fails — name the failure:

| Failure type | What to say | Recovery action |
|---|---|---|
| Session expired | "Your session expired" | "Sign in again →" |
| Network / connection | "Connection lost — check your internet" | "Try again" button |
| Permission denied | "You don't have access to [X]" | "Request access →" or "Contact your admin" |
| Rate limit | "You've reached the limit — [upgrade or wait X mins]" | Clear action with ETA |
| File / input error | "[Specific reason] — [constraint]" (e.g. "File too large — max 5MB") | Specific resolution |
| Server error | "Something went wrong on our end" | "Try again" — never expose technical detail |

Errors must **guide the exit**, not just name the problem. If the error is fixable, the message tells the user exactly how to fix it — not just that something went wrong.

| Weak | Strong |
|------|--------|
| "Invalid API key" | "Your API key is incorrect or expired. Generate a new key in your account settings." |
| "Your deployment failed" | "Something went wrong - try again or contact support." |
| "Payment error" | "Your card was declined. Try a different card or contact your bank." |

Frame errors in a **problem-solving tone**, not a failure tone. Even when something goes wrong, the copy should feel like a hand pointing toward the solution — not a finger pointing at the user.

### CTA Labels
Describe the **outcome**, not the action:
- "Save draft" not "Save"
- "Send to team" not "Share"
- "Delete campaign" not "Delete" ← always name what's being destroyed
- "Export as CSV" not "Export"
- "Continue to payment" not "Next"
- "Save API Key" not "Continue" ← generic verbs hide the consequence of clicking

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

### Loading States & Further-Input Signals
End with `…` (the ellipsis character `…`, not three periods `...`):
- Menu items that open a follow-up dialog — "Rename…", "Move to…", "Export as…"
- Active loading or processing states — "Loading…", "Saving…", "Generating…"

This convention signals: **something more is coming**. It primes the user and eliminates the jarring gap between action and result.

---

## AI Copy Tells (Banned Patterns)

These are signatures of LLM-written copy, drawn from production tests. Hard bans, not preferences:

- **No em-dashes (—) or en-dashes (–) in any user-visible string.** Headlines, body, quotes, attribution, captions, button labels, alt text. Restructure with a period, comma, colon, or parentheses. Ranges use a hyphen. This is binary because "use sparingly" gets ignored.
- **No filler verbs.** "Elevate", "Seamless", "Unleash", "Supercharge", "Next-Gen", "Revolutionize". Use concrete verbs that name what actually happens.
- **No performative-craftsman labels.** "From the field", "Field notes", "On our desks", "Currently on the bench" as section labels. Use plain functional labels ("Testimonials", "Latest writing") or no label.
- **No mock-humble social proof.** "Quietly in use at", "Quietly trusted by". Say "Trusted by" / "Used at", or let the logos speak with no heading.
- **No micro-meta sentences.** Self-aware filler under headings ("The list will stay short on purpose."). Heading + body is enough.
- **No fake-precise numbers in copy.** `92%`, `4.1×`, `48k` must be sourced or labelled as example data, never invented for spec aesthetics.
- **One copy register per surface.** Don't mix technical mono ("47 tasks · 0.6 ctx/day"), editorial prose, and marketing punch in one composition unless the brand voice explicitly calls for it.
- **Quote discipline.** Testimonial quotes max 3 lines. Attribution is name + role (+ company), never name alone. Real typographic quote marks or none.

---

## Copy Self-Audit (run before any output is final)

Before declaring copy done (both modes), re-read EVERY visible string: headlines, subheads, labels, button text, body, captions, alt text, footer, error messages. Flag any string that is:

1. **Grammatically broken** - reads wrong out loud ("free on its past", "two plans but one is honest")
2. **Unclear referent** - "we plan to stay that way" with no prior context establishing what "that way" is
3. **Cute-but-wrong wordplay** - forced metaphors that don't track, "elegant nothing" phrases
4. **LLM-trying-to-sound-thoughtful** - passive-aggressive humility, mock-poetic micro-meta, fake-craftsman voice

Rewrite every flagged string. If unsure whether a string makes sense, replace it with a plain functional sentence. AI-generated clever copy is worse than boring copy.

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
