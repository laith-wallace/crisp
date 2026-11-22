**Finish check.** Before you say a built or changed page is done, measure it as the browser draws it:

```bash
npx @laith-wallace/crisp render-check "<local url>" --width 1280,375
```

- Exit 0: clean. Say so in the report.
- Exit 2: findings. `page-overflow-x`, `overlapping-text`, `text-cut` and `text-spills` are bugs, never style choices. Fix them and run it again, at most 3 rounds.
- Exit 3, no local URL, or no Playwright: report `render-check: untested` with the reason. Never report the page as checked.

Then look at the 1280 and 375 screenshots yourself once, against the taste rules. A clean exit code proves the layout holds, not that the page has taste.
