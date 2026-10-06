# Design plan template

One plan per selected change. The executor has no access to the audit, the conversation, or `.crisp.md` - everything they need is in this file. Every `<placeholder>` is filled or the line is deleted; no placeholder ships.

File name: `design-plans/<kebab-case-outcome>.md`. The outcome names the user-visible result ("unify-card-padding-on-dashboard"), not the symptom ("fix-padding").

```markdown
# <Outcome>

- Written against: <short commit hash, or `unavailable`>
- CRISP dimension: <C / R / I / S / P>
- Severity: <P0 / P1 / P2 / P3>
- Status: <proposed / accepted / done>

## Evidence chain

- Surface: `<path, route, or rendered state>`
- Problem: <direct observation, one sentence>
- Design evidence: `<the binding source - documentation, token, component, pattern, or rendered surface - with file:line>`
- Owner: `<path or surface that owns the correct value>`
- Scope and affected surfaces: `<paths or surfaces>`
- Uncertainty: <none, or exactly what requires validation before executing>

## Design decision

<The appropriately scoped change and why it resolves the root problem, not the symptom. Two sentences maximum.>

## Reuse

- `<token, variable, component, variant, or composition - exact name>`
- Exemplar: `<path to a surface that already does it right>`

If a new primitive is required: state why the existing system cannot express the decision, where the primitive belongs, and every consumer that should share it. Repetition alone is not a reason.

## Changes

1. `<exact path or surface>`
   - Change: <implementation-ready behaviour or structure>
   - Preserve: <valid behaviour or identity that must survive the change>
   - Verify: <observable result at this location>

## Scope

- Inherit: <consumers that receive the change automatically>
- Verify: <consumers that may be affected and must be checked>
- Exclude: <valid exceptions and unrelated work, each with the reason it is excluded>

## Validation

- Product: <the user task and its expected outcome after the change>
- Interface: <routes, states, content extremes, interactions, and viewports to check>
- System: <confirm the reused owner is used and no parallel pattern was created>
- Repository: `<exact check command>` → <expected result>

## Stop conditions

- Stop and report back if <a named assumption fails, ownership changes, or scope must widen>. Do not improvise past a stop condition.

## Design documentation

- After acceptance and validation: <the exact decision to record and its destination file, or `None`>
```

## Rules for the plan author

1. Every path, token, and component name is copied from source, never recalled from memory.
2. `Changes` steps are ordered so the surface never passes through a broken intermediate state.
3. `Preserve` is never empty - if nothing needs preserving, the finding was probably a redesign, not an improvement.
4. The `Repository` check is a command the executor can run verbatim, with its expected output stated.
5. One plan, one root problem. If writing the plan surfaces a second root problem, it goes back through the proof gate, not into this file.
