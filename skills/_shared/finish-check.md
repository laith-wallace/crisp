**Finish check.** Before you say a built or changed page is done, measure it as the browser draws it:

```bash
npx @laith-wallace/crisp render-check "<local url>" --width 1280,375 --shots .crisp/render
```

- Exit 0: clean. Say so in the report.
- Exit 2: findings. `page-overflow-x`, `overlapping-text`, `text-cut` and `text-spills` are bugs, never style choices. Fix them and run it again, at most 3 rounds.
- Exit 3 (inconclusive), exit 1 (no URL, no Playwright, or the page did not load), or no local URL to give it: report `render-check: untested` with the reason. Never report the page as checked.

Then open `.crisp/render/render-1280.png` and `.crisp/render/render-375.png` and look at them once against the taste rules. A clean exit code proves the layout holds, not that the page has taste.
