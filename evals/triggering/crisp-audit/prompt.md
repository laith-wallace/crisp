---
description: Triggering - a natural request that should make Claude choose the crisp-audit skill without naming it.
tags: [triggering]
expected_outcome: Claude invokes the crisp-audit skill.
max_turns: 8
timeout_seconds: 300
allowed_tools: [Read, Glob, Grep, Skill]
---

Give our checkout flow a thorough, scored design evaluation - every dimension, severities, how it compares to the best products, and a prioritised plan. The flow: cart page with a promo-code field above the total, a 4-step form (address, shipping, payment, review) with no progress indicator, a Pay button that stays enabled while the request is in flight, and an order-confirmation page that only says "Thank you".
