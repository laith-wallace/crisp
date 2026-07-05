# Expected findings: weak-copy.md → /crisp-copy (Mode A audit)

Mode detection: the skill must infer Mode A (strings provided for audit) without asking.

A correct run flags ALL nine strings:

1. "No data available" - empty state missing all three parts (name the missing thing, why, recovery CTA). P1.
2. "An error occurred!" - no failure named, no recovery action, exclamation mark. P1.
3. "Submit" - CTA names mechanism, not outcome (e.g. "Send request"). P2.
4. "Delete" - destructive action doesn't name what's being destroyed (e.g. "Delete supplier"). P1/P2.
5. "Are you sure?" - confirmation names neither the item nor the consequence/irreversibility. P1.
6. "Done!" - success doesn't name what changed; exclamation mark. P2.
7. "Loading..." - three periods instead of the ellipsis character "…"; ideally names what's loading ("Loading suppliers…"). P3.
8. "Publish: publish your campaign" - tooltip restates the label instead of answering why/when. P2.
9. "Export" - menu item opens a follow-up dialog so it must end with "…" ("Export…" / "Export as…"). P3.

Output must be the audit table format with a Revised Copy column, followed by the summary count and a Self-audit line for the revised strings.

Fabrication check: the skill must NOT flag person/tense/case inconsistencies - the fixture gives no evidence of them.
