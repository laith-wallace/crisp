---
name: crisp-teach
description: CRISP onboarding command. Run once per project to teach the AI your product context - users, jobs-to-be-done, design system, benchmark references, and anti-references. Writes .crisp.md which all subsequent CRISP commands read automatically.
user-invocable: true
version: "1.1.0"
---

# /crisp-teach - Project Onboarding

Run this command once per project. It learns your design context through a structured interview, then writes `.crisp.md` to your project root. All other CRISP commands (`/crisp-audit`, `/crisp-review`, `/feature-design`, `/handoff`) inherit this context automatically.

## Step 0: Scan Before Asking

If running inside a codebase, scan it before interviewing: `package.json` and the app framework, existing UI components and design tokens (CSS variables, theme files, Tailwind config), marketing pages, and the README. Pre-fill a draft answer for every section you can infer - product type, register, design system, key tokens, primary action - and present each as a confirmation ("This looks like a B2B SaaS product surface using Tailwind with a violet accent - right?") rather than a cold question.

Only ask cold the questions the code cannot answer: who the users are, the job-to-be-done, failure modes, benchmarks, and known weaknesses. This turns a ten-minute interview into a two-minute confirmation.

## Interview Protocol

Work through the following questions with the user. Ask them one section at a time, presenting any pre-filled inference from Step 0 for confirmation instead of asking cold. Don't rush - good context makes every subsequent command significantly more accurate.

---

### Section 1: Product Overview
Ask:
- "What is this product? Describe it in one sentence as if explaining to a potential customer."
- "What stage is it at? (Pre-launch / early customers / growth / mature)"
- "What's the primary action a user takes in this product?"

---

### Section 2: Product Type & Register

First, establish the register - this shapes every downstream CRISP command:

Ask:
- "Is this primarily a **brand surface** (marketing pages, landing pages, campaigns - where the design IS the product) or a **product surface** (app UI, dashboards, authenticated features - where the design SERVES the product)?"

| Register | Goal | Default stance |
|----------|------|----------------|
| **Brand** | Distinctiveness - the interface is what's being sold | Typographic risk, ambitious colour, asymmetric layouts are appropriate |
| **Product** | Earned familiarity - the tool should disappear into the task | Consistency, density, familiar patterns are the priority |

Record the register in `.crisp.md`. Every subsequent CRISP command reads it to adjust its evaluation criteria.

Then ask:
- "Which of these best describes your product?"
  - **B2B SaaS** - sold to businesses, used by teams (project management, CRM, analytics, devtools)
  - **Consumer App** - downloaded or used by individuals for personal goals
  - **E-commerce** - buying, selling, payments, marketplace
  - **Internal Tool** - used by employees, not public-facing (dashboards, admin, ops tooling)
  - **AI-Native Product** - AI is a primary feature, not a supporting one (AI assistant, agent, generative UI)
  - **Other** - describe it

Use their answer to pre-configure defaults in `.crisp.md`:

| Type | Priority CRISP dimensions | Default benchmarks |
|------|--------------------------|-------------------|
| B2B SaaS | S (Seamless) + P (Powerful) | Linear, Retool, Notion |
| Consumer App | C (Contextual) + R (Responsive) | Duolingo, Spotify, Cash App |
| E-commerce | I (Intelligent) + C (Contextual) | Stripe, Shopify, Airbnb |
| Internal Tool | P (Powerful) + S (Seamless) | Retool, Airtable, Metabase |
| AI-Native | C (Contextual) + I (Intelligent) | Perplexity, Claude.ai, Vercel v0, Cursor |

For AI-Native products, also note in `.crisp.md`: `Extensions: CRISP + AI` - this activates `/crisp-ai` evaluation automatically when running audits.

---

### Section 3: Users
Ask:
- "Who is your primary user? Describe them - their role, their day, their level of technical sophistication."
- "What is the job they're hiring your product to do? What were they doing before?"
- "What does failure look like for them? What happens if the product lets them down?"

---

### Section 4: Design System

Ask:
- "Do you have a design system or component library? If so, name it or describe it briefly."
- "What design tokens or visual constraints should I know about? (colours, type scale, spacing)"
- "Are there any components that are off-limits to change?"

When writing the design system section of `.crisp.md`, format constraints as **named rules** rather than bullet lists. Named rules are more memorable, more citable, and more consistently enforced than generic bullets.

Format: `**The [Name] Rule.** [Short doctrine, one sentence.]`

Examples of good named rules:
- `**The One Accent Rule.** Only the primary brand colour appears at high saturation - everything else is neutral.`
- `**The Flat-By-Default Rule.** Surfaces are flat at rest. Elevation tokens appear only on hover or when something is raised above the page.`
- `**The No-Custom-Dropdown Rule.** All select inputs use the system library component - no custom-built replacements.`

Also ask:
- "How would you describe the visual personality of this product in three words - ideally physical objects or specific feelings, not adjectives like 'modern' or 'clean'?"

Use the answer to write a **Creative North Star** - a single named metaphor for the visual identity that anchors all CRISP skills. More specific than "clean and modern."

Example: "The Lab Notebook" (precise, structured, always slightly imperfect), "The Corner Bookshop" (warm, unhurried, browsable), "The SRE Console" (information-dense, high-contrast, fast).

---

### Section 5: Benchmarks
Ask:
- "Which products do you most admire from a design perspective? These become your positive references. (Press Enter to accept the defaults for your product type)"
- "Which products do you NOT want to look or feel like? These become your anti-references."
- "Of the CRISP dimensions - Contextual, Responsive, Intelligent, Seamless, Powerful - which matters most for your users right now? (Press Enter to accept the product-type default)"

---

### Section 6: Known Weaknesses
Ask:
- "What's the biggest UX problem you already know exists?"
- "Which user flows feel most broken or incomplete?"
- "Is there anything that's off-limits for this audit? (legacy constraints, upcoming changes)"

---

## Output Format

Once the interview is complete, write a `.crisp.md` file to the project root with this structure:

```markdown
# .crisp.md - CRISP Design Context
*Generated by /crisp-teach. Update by running /crisp-teach again.*

## Product
[One-sentence product description]
Stage: [Pre-launch / Early / Growth / Mature]
Primary action: [What users mainly do]
Type: [B2B SaaS / Consumer / E-commerce / Internal Tool / AI-Native / Other]
Register: [Brand / Product]

## Users
Primary user: [Role + sophistication level]
Job-to-be-done: [What they're hiring the product for]
Failure mode: [What happens if the product lets them down]

## Design System
Creative North Star: [Named metaphor - e.g. "The Lab Notebook", "The SRE Console"]
System: [System name or description]
Key tokens: [Colours, type, spacing constraints]

Named Rules:
- **The [Name] Rule.** [Short doctrine.]
- **The [Name] Rule.** [Short doctrine.]
[Add one named rule per major design constraint - minimum two, maximum six]

## Benchmarks
Positive references: [Products to aspire to]
Anti-references: [Products to avoid resembling]
Priority CRISP dimension: [C / R / I / S / P]

## Extensions
[e.g. "CRISP + AI" for AI-Native products - activates /crisp-ai automatically]

## Known Issues
[List of acknowledged UX problems]
[Off-limits areas]

## History
<!-- CRISP appends a summary line here after each /crisp-audit or /crisp-review run. -->
<!-- Format: - YYYY-MM-DD | /command | C:x R:x I:x S:x P:x | Grade: X | Top issue: [summary] -->
```

When writing any date into `.crisp.md`, get today's date from the `date` command (`date +%Y-%m-%d`) - never from memory.

Confirm to the user that `.crisp.md` has been written and that all CRISP commands will now use this context automatically.
