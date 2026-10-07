---
description: Negative triggering - an ordinary coding request where no CRISP skill should fire.
tags: [triggering, negative]
expected_outcome: Claude answers directly and invokes no CRISP skill.
max_turns: 5
timeout_seconds: 180
allowed_tools: [Read, Glob, Grep, Skill]
---

Rename the variable `usr` to `user` in this function and give me the updated code:

```js
function greet(usr) {
  return `Hello, ${usr.name}`;
}
```
