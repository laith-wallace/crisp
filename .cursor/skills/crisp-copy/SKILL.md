---
name: crisp-copy
description: Write and evaluate UI microcopy - labels, empty states, errors, tooltips, CTAs, onboarding hints - in audit or generate mode. Use when the user asks for button labels, error wording, or empty state text, even if they never say 'microcopy'.
metadata:
  version: "1.1.1"
  checked: "2026-11-22"
  checked-with: "claude-opus-5-5"
---

# /crisp-copy - UX Microcopy Specialist

Copy is the most underestimated design material. A spinner with "Loading..." is not the same as "Fetching your deals." A generic "Error" is not the same as "Payment failed - your card was declined. Try a different card or contact your bank." Every string in a UI is a design decision.

Load `.crisp.md` if it exists - product context informs voice, terminology, and user expectations.

## Register Detection

Before writing or auditing any copy, read the register from `.crisp.md`:

| Register | Copy stance |
|----------|-------------|
| **Brand** | Lead with personality. Voice is the product. Tolerance for unexpected word choices, metaphor, rhythm. |
| **Product** | Lead with clarity and recovery. Voice disappears into the task. No clever language at high-stakes moments. |

If `.crisp.md` is absent, infer the register from the surface itself (a pricing page is Brand; a settings screen is Product) and declare the inference. Ask "Is this a marketing page or a product UI?" only when the surface could genuinely be either. The answer changes the voice entirely.

---

## Mode Detection

Infer the mode from the request before asking. Strings pasted with "review", "check", or "improve" = Mode A. "Write me", "I need copy for", or a component with no existing strings = Mode B. If the mode is evident, declare it ("Auditing the 6 strings you pasted") and proceed. Ask **"Are you auditing existing copy or generating new copy?"** only when genuinely ambiguous.

- **Mode A - Audit**: User provides a screen description, screenshot, or list of strings. Evaluate what exists.
- **Mode B - Generate**: User provides a component type and context. Write the strings from scratch.

---

## The Timeless Copy Rules

These apply in both modes. Every string is evaluated against them.

### Empty States
Must have three parts:
1. **Name the thing that's missing** - "You haven't added any team members yet" (not "No data")
2. **Explain why** - if not obvious (e.g. "Invites are sent after you publish your project")
3. **One recovery action** - a specific CTA ("Invite your first team member →")

### Error Messages
Must have two parts:
1. **What went wrong - specifically** - "Your session expired" (not "Something went wrong"), "File too large - maximum is 5MB" (not "Upload failed")
2. **What the user can do next - specifically** - "Sign in again →", "Compress the file and try again"

Match the failure type to the recovery action. Generic "Something went wrong" always fails - name the failure:

| Failure type | What to say | Recovery action |
|---|---|---|
| Session expired | "Your session expired" | "Sign in again →" |
| Network / connection | "Connection lost - check your internet" | "Try again" button |
| Permission denied | "You don't have access to [X]" | "Request access →" or "Contact your admin" |
| Rate limit | "You've reached the limit - [upgrade or wait X mins]" | Clear action with ETA |
| File / input error | "[Specific reason] - [constraint]" (e.g. "File too large - max 5MB") | Specific resolution |
| Server error | "Something went wrong on our end" | "Try again" - never expose technical detail |

Errors must **guide the exit**, not just name the problem. If the error is fixable, the message tells the user exactly how to fix it - not just that something went wrong.

| Weak | Strong |
|------|--------|
| "Invalid API key" | "Your API key is incorrect or expired. Generate a new key in your account settings." |
| "Your deployment failed" | "Deploy failed: build exceeded 10 min. View logs" |
| "Payment error" | "Your card was declined. Try a different card or contact your bank." |

Frame errors in a **problem-solving tone**, not a failure tone. Even when something goes wrong, the copy should feel like a hand pointing toward the solution - not a finger pointing at the user.

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
- Don't restate the label - "Publish makes your campaign live and sends it immediately" not "Publish: publish your campaign"

### Onboarding Hints
- Lead with the value, not the action
- "See where your revenue is trending" not "Click the Analytics tab"
- "Track every deal in one place" not "Use the pipeline view"

### Destructive Actions
- Always name the specific thing being destroyed
- Always state irreversibility if true: "Delete campaign - this can't be undone"
- Offer a safer alternative when possible: "Archive instead →"

### Loading States & Further-Input Signals
End with `…` (the ellipsis character `…`, not three periods `...`):
- Menu items that open a follow-up dialog - "Rename…", "Move to…", "Export as…"
- Active loading or processing states - "Loading…", "Saving…", "Generating…"

This convention signals: **something more is coming**. It primes the user and eliminates the jarring gap between action and result.

---

## Mode A - Audit Existing Copy

For each string the user provides, evaluate it against the rules above and the CRISP dimensions.

**Output format - Audit table:**

```
## Copy Audit: [Screen / Component Name]

| Location | Current Copy | Violation | Severity | Revised Copy |
|----------|-------------|-----------|----------|-------------|
| Empty state | "No data available" | [C] No context, no CTA | P1 | "You haven't added any suppliers yet. [Add your first supplier →]" |
| Submit button | "Submit" | CTA names action not outcome | P2 | "Send request" |
| Error banner | "An error occurred" | No specificity, no recovery | P1 | "Connection lost - check your internet and try again" |
```

**Severity guide:**
- P0 - Blocks comprehension entirely (user cannot continue without understanding this)
- P1 - Misleads or leaves user without a recovery path
- P2 - Generic; user can infer meaning but shouldn't have to
- P3 - Suboptimal word choice, minor clarity improvement

After the table, add:

```
### Summary
[X] strings reviewed. [X] violations found. [X] P0/P1 require immediate attention.

Top issue: [Single most impactful fix]
```

---

## Mode B - Generate New Copy

If the request already names the component or context, start writing. Ask **"What component or context are you writing copy for?"** only when it is unnamed, because the infer-first rule in Mode Detection applies here too.

Common component types and their templates:

**Empty state**
```
You haven't [done X] yet.
[Why this matters / what they're missing - optional]
[Primary CTA - outcome-oriented label]
```

**Error message**
```
[What specifically went wrong].
[What the user can do next - specific action or link].
```

**Success confirmation**
```
[Specific thing that happened].
[What changed or what comes next - optional].
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
[Value the user gets - lead with the outcome]
[How to get there - one clear action]
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

## Copy Self-Audit

Run this over every string you wrote or touched, before delivering. `/crisp-redesign` calls this checklist by name. Binary checks - each string passes or fails:

1. Empty states: all three parts present (names the missing thing, explains why if not obvious, one recovery CTA)?
2. Errors: names the specific failure AND the specific next action?
3. CTAs: describe the outcome, not the mechanism ("Save draft", not "Submit")?
4. Destructive actions: name the thing being destroyed, and state irreversibility if true?
5. Success messages: name exactly what changed, not "Success" or "Done"?
6. Loading and follow-up items: end with the ellipsis character "…"?
7. Zero em dashes, zero exclamation marks, zero "click here" in any string.

Fix failures before delivery - do not report them as findings. Report one line: `Self-audit: [N] strings checked, all pass.`

---

## Copy System Derivation

If `.crisp.md` exists, derive these conventions for the product and include them at the end of any audit or generation output:

```
## Copy System: [Product Name]

Voice: [Formal / Casual / Technical / Plain - with one example]
Person: [Second-person ("You haven't...") / First-person ("My dashboard") - pick one and stay consistent]
Tense: [Present for state ("3 deals open"), past for confirmation ("Campaign sent")]
Case: [Sentence case for UI text / Title Case for headings only]
Terminology: [Product-specific terms to always use - e.g. "deals" not "opportunities"]
Avoid: [Terms to never use - e.g. "submit", "click", "portal", brand competitor names]
```

This section can be committed to the project as a copy reference for the whole team.

## Taste rules

<!-- crisp:shared taste -->
**Taste rules.** Each rule is a count, so a check can say pass or fail. Rules 1 to 7 apply when this skill makes or judges a rendered UI (a screen, a page, a component). The copy tells apply to all copy, prose included. Where this skill states a stricter limit for the same pattern, the stricter limit wins.

1. **One detail only this client has.** Each screen shows at least 1 detail taken from the brief or the product: its units, its terms, its real prices, hours or numbers. A screen that would fit any business in the category fails.
2. **Real material first.** The client's own product, UI, photos and words lead. A stand-in (stock photo, mock data, coined name) is listed in the report as a stand-in. Zero stand-ins are presented as the client's own.
3. **One system.** 1 primary and 1 secondary button style, 1 card style, 1 radius scale, 1 heading scale, 1 link style per surface.
4. **One bold move per screen.** At most 1 element per screen breaks the system (an oversized heading, a full-bleed photo, a colour block). Everything around it stays quiet.
5. **Structure says something true.** Numbers (01, 02) only on steps a user follows in order. A label over a heading only when it adds information the heading does not.
6. **Motion answers the user.** Every button, link and linked card answers hover and press. Zero sections fade in on scroll by default. Anything that moves for more than 5 seconds has a pause control.
7. **Read the taste bank.** When `.crisp/taste-bank/` exists, read it before designing and name the 1 or 2 references this work borrows from, and what it borrows. Never copy a reference's code, copy, images or signature effect.

**Copy tells that current models still write.** These look like good copy, so they pass review. Count them on the whole surface.

| Tell | Limit | Fix |
|---|---|---|
| Invented specifics: room numbers, batch numbers, times, percentages the brief does not give | 0 | Use a fact from the brief, or write a plainer line |
| A strip of 3 or 4 figures over one-word labels | 0, unless every figure is a brief fact (price, hours, count) | Put each figure in the sentence it proves |
| Two-fragment heading, "X. Y." ("Twelve rooms. Three ways to stay.") | 1 | A name with a claim under it, a verb and the thing, or one plain sentence |
| Number-pair heading ("Four projects, four problems") | 0 | Say what the section holds |
| Contrast frames: "not X but Y", "isn't X", "rather than", "instead of", "without the" | 2, all forms counted together | State the positive fact alone |
| Negation runs ("No forms, no waiting") | 1 | Keep it only when each item is a refusal the buyer can check |
| Virtue words about the client: honest, calm, quiet, quietly, genuinely, truly, simply, thoughtful, carefully, intentional | 0 | Show it with a fact or an admission |
| A dry closing quip at the end of a paragraph | 1 | End on information |
| Default cast names: Priya, Okafor, Marcus, Dana, Aisha, Theo, Kestrel, Halcyon, Acme, Northwind, Lumen, Nimbus, Zenith | 0 | Names only from the brief; mock names that fit the place and age |
| The same section shape (label, heading, short lede, 3 cards) used back to back | 2 in a row | Shape each section from the question the reader has there |
| Testimonials or quotes the brief does not give word for word | 0 | Leave them out |
| Unsourced proof figures ("3x faster", "10,000+ teams", "98% happy") | 0 | Only figures from the brief, with their unit, in a sentence |
| The page talks about itself ("Below you'll find", "This section shows") | 0 | Say the thing |

**Over-correction.** Every ban breeds a substitute. Check for the substitute too.

| Rule applied | Habit it breeds | Counter |
|---|---|---|
| No em dashes | Comma splices and nothing but full stops | Rewrite the sentence: split it in two, or join the parts with a plain word ("and", "so", "because") |
| No "not X but Y" | "rather than", "instead of", "without the" | Count them together; state the positive |
| No hype words | Calm words: quietly, steady, honest, practical | A fact in place of the adjective |
| Avoid lists of three | Everything in pairs | List as many items as there are |
| Be specific | Invented numbers and stories | Brief facts, or a plainer line |
| Short sentences | A drumbeat of fragments | Let 1 sentence per section run long |
| End strong | A moral or quip on every paragraph | End on information |
| Vary section length | One huge and one tiny section on every page | Length follows the material |
<!-- /crisp:shared taste -->

## Lessons

<!-- crisp:shared lessons -->
**Lessons log.** The pack learns the user's taste from their corrections.

- **Before you start:** when `.crisp/lessons.md` exists, read it. Apply every line tagged with this skill or with `all`.
- **This file is always writable.** Appending to `.crisp/lessons.md` is allowed even in a skill that is otherwise read-only or limited to the target's files. It is the only such exception.
- **When the user corrects or rejects your output:** append 1 line to `.crisp/lessons.md` (create it if needed) in this shape:
  `- YYYY-MM-DD | <skill or all> | <what was wrong> | <the rule that would have prevented it>`
  Write the rule as a count or a yes/no check, so a later run can test it. One correction, one line. Never log praise, and never log a line the user did not cause.
- **Promote:** when the same rule appears 3 times, tell the user it is ready to move into the pack's shared taste rules (`skills/_shared/taste.md` in the CRISP repo).
<!-- /crisp:shared lessons -->

## Next step

End the report with one line, `Next: <command> - <why>`, picked from these by what this run found. Where the report template above has a **Next:** line, this is that line, never a second one:

- Then: `/crisp-review`
