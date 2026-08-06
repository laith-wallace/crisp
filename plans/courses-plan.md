# CRISP Courses Plan

*Created: 2026-08-06. Status: Phase 1 in progress (free tutorials).*

## Reference model

AI Hero (aihero.dev, Matt Pocock) no longer has a `/courses` page. Their current structure is three tiers:

1. Free tutorials as SEO/AEO surface area (`/vercel-ai-sdk-tutorial`, `/ai-engineer-roadmap`, `/model-context-protocol-tutorial`)
2. Paid workshops (`/workshops/ai-sdk-v6-crash-course`)
3. A paid **skills subscription** (`/skills` with ~25 individual skill pages and a public changelog as proof of life)

We hold the same shape of asset with the CRISP skill pack. Mirror the structure, not the content.

## The five courses (priority order)

### 1. Flagship: "The CRISP Method" (paid, ~2-4 hours)
The full workflow already encoded in the skill pack: brief → research → feature-design → review/audit → redesign → production-ready. Teaches the methodology (binary countable rules, evidence-locked findings, P0-P3 severity). Every lesson ends with "now run `/crisp-audit` on your own project" - the skill pack is the course's lab equipment, the course is the skill pack's marketing.

### 2. "Landing Pages That Convert with AI" (paid workshop)
Built on crisp-funnel's ATM methodology (Attention, Trust, Money) and the ten-section Funnel Kit. Highest commercial-intent audience: founders and marketers with a page that isn't converting. Stands alone - buyable without caring about the rest of CRISP.

### 3. "Designing AI-Native Interfaces" (paid workshop, timely)
crisp-ai as a course: chat, streaming, generative UI, agent surfaces. Almost no structured education exists here yet - best shot at ranking and AI-engine citation while the space is uncrowded.

### 4. Free tutorial tier (the funnel) - PHASE 1, IN PROGRESS
Short single-topic pieces from the smaller skills, each ending with "install the skill and run it":

| Tutorial | Source skill | Primary keyword | Draft |
|----------|-------------|-----------------|-------|
| WCAG 2.2 checklist | crisp-a11y | "WCAG 2.2 checklist" | `tutorials/wcag-2-2-checklist.md` |
| UX laws for interfaces | crisp-ux-laws | "UX laws" | `tutorials/ux-laws-for-interface-design.md` |
| UI microcopy guide | crisp-copy | "UI microcopy" | `tutorials/ui-microcopy-guide.md` |
| AI design review | crisp-review | "AI design review" | `tutorials/ai-design-review.md` |

Each tutorial follows the blog SEO/AEO standards: TL;DR box, featured-snippet answer after the H1, self-contained H2s, definition box, min 4 FAQ pairs, Article + FAQPage schema, author credential, last-updated date, 2+ external citations, 3+ internal links.

### 5. Later: "Build Your Own Skill Pack" (meta course)
How the CRISP suite was built: progressive disclosure, context-load conventions, binary rules, versioning and sync. Positions us as an authority on skill authoring, not just design.

## Launch rules

- Do NOT launch `/courses` with five cards where four say "coming soon". Launch with the free tutorials plus one flagship; let the page grow.
- Consider a skills subscription page as a sibling to `/courses` (AI Hero's model) - recurring revenue on the thing already maintained and versioned, with CHANGELOG.md as ongoing proof of life.

## Current status / next steps

- [x] Free tutorial drafts written (`tutorials/`) - 2026-08-06
- [ ] Video versions of each free tutorial (owner: Laith - recording)
- [ ] Site pages for tutorials (slugs planned as getcrisp.design/tutorials/<slug>)
- [ ] Publish-time checklist per tutorial: validate schema, confirm canonical/OG URLs, convert images to WebP, add internal link from an existing high-traffic page
- [ ] Outline "The CRISP Method" flagship course
- [ ] Decide pricing model: one-off workshops vs skills subscription vs bundle
