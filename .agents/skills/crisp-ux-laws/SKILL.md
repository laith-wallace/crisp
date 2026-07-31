---
name: crisp-ux-laws
description: Cognitive and perceptual laws applied to interface decisions - Fitts, Hick, Miller, Doherty Threshold, Von Restorff, Proximity, Common Region - mapped to CRISP dimensions and actionable rules. Use during design reviews or when evaluating interaction complexity.
user-invocable: true
version: "1.1.0"
---

# CRISP UX Laws - `/crisp-ux-laws`

These are not decorative theory. Each law is a constraint on human perception and motor behaviour that the interface either respects or violates. Violations have predictable consequences. This skill names them, maps them to CRISP dimensions, and specifies the fix.

Use these laws as diagnostic tools during `/crisp-audit`, `/crisp-review`, or any time an interaction feels wrong and you need to name why.

---

## Fitts' Law

**The principle:** Time to acquire a target is a function of target size and distance from the cursor. Smaller targets farther away take longer to reach.

**Formula (practical):** Acquisition time increases logarithmically as targets shrink or distance grows.

**What breaks it:**
- Small click targets on frequently used actions (< 44px on touch, < 24px on desktop)
- Destructive actions far from the user's current focus (confirm button bottom-right when the action was top-left)
- Interactive elements with invisible or misleadingly small hit areas (icon-only buttons without padding)
- Contextual actions placed far from the content they act on (table row actions in a separate column vs. on hover inline)

**What applies it well:**
- Full-width mobile buttons for primary actions
- Edge-snapping menus (Fitts noted screen edges are infinitely large targets - the cursor stops)
- Inline actions on hover that appear immediately adjacent to the target content
- Generous padding around small icons to extend the effective hit area without changing visual size

**CRISP dimension:** **S - Seamless**
Fitts' Law violations make the interface fight the user's body. Every extra pixel of travel is friction measured in motor time. An action that takes twice as long to reach is half as seamless, even if the UI is otherwise perfect.

**Audit question:** Are the most frequent actions the easiest targets to acquire? Is the primary CTA visually large and spatially near the user's likely cursor position?

---

## Hick's Law

**The principle:** Decision time increases logarithmically with the number of choices. More options = more time = more cognitive load.

**What breaks it:**
- Navigation menus with 10+ items at the same visual weight
- Settings pages that surface every option to every user regardless of role or frequency
- Modals with 4+ actions of similar importance
- Dropdowns longer than 7 items without search, grouping, or progressive filtering
- Onboarding flows that ask the user to configure everything before they've done anything

**What applies it well:**
- Progressive disclosure - surface 3–5 primary options, collapse the rest
- Contextual filtering - show actions relevant to the current state, hide irrelevant ones
- Role-based views - power users see more, new users see less
- Sensible defaults - the user makes a decision by doing nothing, not by choosing nothing
- Search before browse for large option sets

**CRISP dimension:** **P - Powerful**
Hick's Law violations flatten the power structure. When everything is equally visible, nothing is easy. The powerful interface hides complexity appropriately - novices see a clear path, power users know where to dig.

**Audit question:** How many options does the user face at their most common decision point? Is there a clear recommended path, or are all options presented as equal?

---

## Miller's Law

**The principle:** Working memory holds roughly 7 (± 2) items at once. Beyond that, recall degrades.

**The common misapplication:** This law is not about limiting menus to 7 items. It is about chunking - organising information so the user processes grouped units, not individual items.

**What breaks it:**
- Long unsegmented forms (20 fields with no visual grouping)
- Data tables with 15+ columns of similar visual weight
- Breadcrumbs or navigation paths longer than 4 levels without compression
- Multi-step flows where progress is not tracked - the user loses count of where they are
- Dense dashboards with numbers presented as undifferentiated lists

**What applies it well:**
- Form sections with headers that chunk related fields (Personal → Contact → Preferences)
- Table column groups that visually separate entity attributes from status from actions
- Step indicators that show total steps so users can calibrate mental effort
- Card grids that show 4–6 items rather than all results, with pagination or load-more
- Data presented with comparisons and context rather than raw numbers (chunked by meaning)

**CRISP dimension:** **I - Intelligent**
Miller's Law violations make the interface dump data at the user. Chunking is intelligence applied to presentation - organising information so the user processes insights, not inventory.

**Audit question:** Does the interface group related information visually and spatially? Does the user need to hold more than 5–7 distinct items in memory at any point in the flow?

---

## Doherty Threshold

**The principle:** Productivity increases when a computer and its users interact at a pace (< 400ms) that ensures neither has to wait on the other.

**The implication:** 400ms is not a performance target - it is a perception boundary. Above it, users consciously notice the wait. Below it, the system feels instant. These are qualitatively different experiences, not a continuous scale.

**What breaks it:**
- Any user-initiated action (filter, sort, search, tab switch, form field validation) that responds in > 400ms without optimistic UI
- Spinner used for operations the system could predict the result of
- Animations longer than 300ms on frequently triggered interactions (animation is perceived delay)
- Network round-trips on every keystroke (search without debounce, filters without local computation)

**What applies it well:**
- Debounced search: query fires 200–300ms after the user stops typing
- Optimistic UI: apply the change immediately, reconcile with the server in the background
- Instant local filtering when the full dataset is already loaded
- Preloading likely next states (hover-prefetch on navigation items)
- Skeleton screens for operations > 400ms - not to meet the threshold, but to make the wait feel designed

**CRISP dimension:** **R - Responsive**
The Doherty Threshold is the quantitative foundation of the R dimension. Every CRISP R violation is a Doherty violation at its root. The question is always: is the UI responding at a pace that keeps the user in flow, or is it making them wait?

**Audit question:** Which user actions take > 400ms to produce visible feedback? Of those, which could be made instant with optimistic UI or local computation?

---

## Von Restorff Effect

**The principle:** An item that differs from those around it is more likely to be remembered and noticed. Isolation creates salience.

**What breaks it:**
- Multiple elements on the same screen competing for prominence with the same visual treatment (weight, colour, size)
- Primary CTA styled identically to secondary actions - no isolation creates no hierarchy
- Status indicators (error, warning, success) using muted colours that don't differentiate from neutral content
- Every card or table row emphasised with colour when emphasis should go to the exception, not the rule

**What applies it well:**
- One and only one primary action at the highest visual weight per view
- Error states distinguished by hue, not just by text - colour is preattentive, text is not
- The anomalous data point in a chart highlighted rather than requiring the user to find it
- Onboarding callouts that use visual isolation (colour, border, position) to separate from existing UI
- Empty state illustrations that are visually distinct from populated states - so users recognise them immediately

**CRISP dimension:** **C - Contextual**
Von Restorff violations destroy orientation. When everything is equally emphasised, nothing is. The user cannot tell what to do next because the interface offers no signal. Context requires hierarchy - and hierarchy requires that something be different.

**Audit question:** Is there one clear primary emphasis per view? Are exception states (errors, warnings, recommended actions) visually isolated from neutral content?

---

## Law of Proximity

**The principle:** Elements close to one another are perceived as related. Distance implies separation of meaning.

**What breaks it:**
- Labels visually equidistant from two fields - the user cannot tell which label belongs to which input
- Action buttons (Save, Cancel) spaced far from the form they act on
- Metadata (timestamps, authors) placed closer to the wrong content block
- Section headers with insufficient spacing above them - they appear to belong to the previous section rather than the next
- Inline validation errors that appear far from the field that produced them

**What applies it well:**
- Grouping related form fields with shared spacing (tight within group, loose between groups)
- Action buttons directly below or beside the content they act on
- Cards that contain all related content within a single boundary - proximity is reinforced by containment
- Helper text and error messages positioned immediately below their input field
- Navigation items grouped by workflow proximity, not alphabetical order

**CRISP dimension:** **C - Contextual**
Proximity violations break spatial orientation. The user reads spatial relationships as semantic relationships. When the interface says "these are related" through proximity, the user acts on it - and a violation costs them the cognitive effort of correcting a wrong assumption.

**Audit question:** Does every label, action, status, and metadata item sit closer to what it belongs to than to what it doesn't? Are spacing decisions communicating grouping, not just filling space?

---

## Law of Common Region

**The principle:** Elements within a clearly defined boundary are perceived as a group, regardless of proximity.

**What breaks it:**
- Cards with inconsistent borders or backgrounds that blur the boundary between distinct content groups
- Tables without row separation - rows blend into each other, especially in dense data
- Modal dialogs without sufficient visual separation from the page behind them (no backdrop, no border, no elevation)
- Dropdowns that blend into the surface below them - no clear containment boundary
- Sidebar and main content at the same visual level with no separating element

**What applies it well:**
- Card borders or background tints that create a clear contained region
- Alternating row shading or row borders in data tables
- Modal backdrops and elevated surface treatment that visually separate the modal from page content
- Tooltip and popover regions with a distinct border and drop shadow
- Sidebar separation via a single border at consistent opacity - not a different background colour (which creates two separate "worlds")

**Note on sidebar depth:** The interface-design principle applies here - sidebars sharing the same background as main content with a single border separator feel unified. Different background colours fragment the UI into distinct regions that feel like different applications. Use common region for grouping, not for demarcating the product's main regions.

**CRISP dimension:** **C - Contextual**
Common Region violations fragment spatial understanding. The user builds a mental map of the interface from its visual boundaries. When boundaries are ambiguous or inconsistent, the mental map is wrong - and every action taken from a wrong mental map takes longer.

**Audit question:** Are the visual containers in this design creating the groupings you intend? Are there groupings the design implies but the interface fails to contain?

---

## Using These Laws in Audits

When a CRISP audit identifies an **R** violation: check Doherty Threshold first - is the system responding in < 400ms? If not, check Fitts' Law - is the user's target hard to reach?

When a CRISP audit identifies a **C** violation: check Von Restorff (is there clear emphasis hierarchy?), Proximity (are related things spatially near?), and Common Region (are groupings visually contained?).

When a CRISP audit identifies a **P** violation: check Hick's Law (too many choices exposed at once?) and Miller's Law (too many items without chunking?).

When an interaction feels slow: check Doherty (is feedback > 400ms?). When it feels cluttered: check Miller (too many ungrouped items?). When the primary action is hard to find: check Von Restorff (is it visually isolated?). When actions feel hard to click: check Fitts' (are hit areas adequate?).

---

## Output Format

When invoked during a review or as a standalone check:

```
/crisp-ux-laws: [Component or Flow Name]
─────────────────────────────────────────────────

LAW VIOLATIONS IDENTIFIED

| Law | Violation | CRISP | Fix |
|-----|-----------|-------|-----|
| Fitts' | Delete button 12px, no padding | S | Expand hit area to 44px with padding |
| Doherty | Filter applies on round-trip at ~600ms | R | Local filter on loaded dataset; debounce at 200ms |
| Hick's | 11 nav items at equal visual weight | P | Surface 5 primary, collapse rest under More |
| Proximity | Error message 40px below its field | C | Position error immediately below input, 4px gap |

─────────────────────────────────────────────────

NO VIOLATIONS

| Law | Assessment |
|-----|-----------|
| Miller's | Form chunked into 3 sections - within threshold |
| Von Restorff | Single primary CTA clearly isolated |

─────────────────────────────────────────────────

[Any laws not assessable from the available context - note what would be needed]
```

---

*CRISP UX Laws Skill - getcrisp.design*
*Part of the CRISP skill pack · github.com/laith-wallace/crisp*
*Laws sourced from: Fitts (1954), Hick (1952), Miller (1956), Doherty & Thadani (1982), Von Restorff (1933), Wertheimer (1923)*
