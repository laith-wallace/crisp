---
description: Graded - regression fixture slop-prose.md against crisp-unslop. Expected findings mirror tests/expected/.
tags: [graded, crisp-unslop]
expected_outcome: See the matching file in tests/expected/.
max_turns: 30
timeout_seconds: 900
allowed_tools: [Read, Glob, Grep, Skill]
---

Our blog post draft `slop-prose.md` sounds like AI wrote it. Don't rewrite it yet - just detect the AI-sounding patterns and tell me where they are. It's in the read-only fixture directory attached to this session (use Glob or Read to find it).
