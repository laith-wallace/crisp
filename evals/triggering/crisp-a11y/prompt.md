---
description: Triggering - a natural request that should make Claude choose the crisp-a11y skill without naming it.
tags: [triggering]
expected_outcome: Claude invokes the crisp-a11y skill.
max_turns: 8
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

Can someone using a screen reader, or only a keyboard, actually get through this signup form? Check it against WCAG and tell me what to fix in code:

```html
<div class="form">
  <input placeholder="Email">
  <input type="password" placeholder="Password">
  <div class="btn" onclick="submit()">Sign up</div>
  <span style="color:#aaa">Password must be 12+ characters</span>
</div>
```
