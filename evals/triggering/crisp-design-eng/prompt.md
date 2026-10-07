---
description: Triggering - a natural request that should make Claude choose the crisp-design-eng skill without naming it.
tags: [triggering]
expected_outcome: Claude invokes the crisp-design-eng skill.
max_turns: 8
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

The tooltip and the popover in our toolbar both feel janky when they open, and the button press feels dead. Make them feel right:

```css
.tooltip { opacity: 0; transition: all 500ms linear; }
.tooltip.show { opacity: 1; }
.popover { transform: scale(0); transition: all 350ms ease-in; }
.popover.open { transform: scale(1); }
.toolbar-btn { transition: all 200ms; }
```
