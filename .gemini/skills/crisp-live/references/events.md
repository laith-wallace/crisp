# CRISP Live event schema

Everything lives in `.crisp/live/` at the project root (git-ignored by its own `.gitignore`):

| File | Written by | Holds |
|---|---|---|
| `session.json` | the bridge, while running | `{ "port", "token", "startedAt", "pid" }` |
| `events.jsonl` | the bridge (overlay posts) | one event per line, overlay -> agent |
| `responses.jsonl` | the bridge or `crisp live respond` | one response per line, agent -> overlay |

Events and responses share one increasing `seq`. Ids are `evt_<seq>` and `res_<seq>`.

## Event status

`pending` (just posted) -> `claimed` (returned by `crisp live next`) -> `responded` (a `variants` or `done` response) or `failed` (an `error` response).

## Common fields (every event)

```json
{
  "id": "evt_4",
  "seq": 4,
  "ts": "2026-10-14T09:12:03.120Z",
  "status": "claimed",
  "type": "command",
  "page": {
    "url": "http://localhost:5173/pricing?variant=a",
    "title": "Pricing",
    "variant": "a",
    "viewport": { "width": 1280, "height": 800, "dpr": 2, "scrollX": 0, "scrollY": 412 },
    "colorScheme": "light"
  }
}
```

The bridge sets `id`, `seq`, `ts`, and `status`; values the page sends for them are ignored.

## Element (on `command`, `comment`, `edit-text`)

```json
"element": {
  "selector": "#pricing > div.plans > article:nth-of-type(2) > h3",
  "tag": "h3",
  "id": null,
  "classes": ["plan-name"],
  "role": null,
  "ariaLabel": null,
  "text": "Team",
  "outerHTML": "<h3 class=\"plan-name\">Team</h3>",
  "styles": { "font-size": "20px", "font-weight": "600", "color": "rgb(29, 29, 39)", "padding": "0px", "...": "..." },
  "box": { "x": 412, "y": 188, "width": 220, "height": 28, "pageX": 412, "pageY": 600 },
  "source": { "file": "src/components/Plans.tsx", "line": 41, "column": 9, "via": "react-fiber", "component": "PlanCard", "depth": 0 }
}
```

- `selector` prefers a stable id, then `data-testid` / `data-test` / `data-cy`, then a short path with classes and `:nth-of-type`. Hashed class names and generated ids are skipped.
- `text` is capped at 400 characters and `outerHTML` at 4,000; both end with `…[truncated N chars]` when cut.
- `box` x/y are viewport pixels at send time; `pageX`/`pageY` add the scroll offset. To get pixels, screenshot the page at `page.viewport` and crop to the box.
- `source` is `null` when nothing was found. `via` says where it came from, nearest first: `data-crisp-src`, `data-source`, `data-v-inspector`, `data-locator`, `data-inspector` (react-dev-inspector), `react-fiber` (`_debugSource`, React 18 and earlier in development), `vue` (`__file`, component level, no line), `svelte` (`__svelte_meta`). `depth` 0 means the element itself; higher means an ancestor's location.

## Types

### `command`

```json
{ "type": "command", "commands": ["quieter", "rewrite-copy"], "comment": "too shouty", "variants": 2, "element": {}, "page": {} }
```

`commands` ids: `bolder`, `quieter`, `simpler`, `fix-layout`, `animate`, `adapt-mobile`, `rewrite-copy`, `check-a11y`. `variants` is the number of new options, 1 to 3 (1 means apply directly).

### `comment`

A `command` with no chips: `{ "type": "comment", "commands": [], "comment": "...", "variants": 1, "element": {}, "page": {} }`.

### `edit-text`

```json
{ "type": "edit-text", "oldText": "Get started for free", "newText": "Start a free trial", "element": {}, "page": {} }
```

`element` is captured before the edit, so `outerHTML` and `text` hold the old text. Both texts are trimmed.

### `insert`

```json
{
  "type": "insert",
  "description": "Case study: one quote and three numbers",
  "variants": 1,
  "box": { "pageX": 200, "pageY": 1520, "width": 700, "height": 320 },
  "anchor": { "selector": "section.features", "tag": "section", "source": { "file": "src/app/page.tsx", "line": 30, "via": "data-crisp-src", "depth": 0 } },
  "page": {}
}
```

`anchor` is the element under the centre of the drawn box (`null` over empty body). Place the new section next to it, in the same parent.

### `accept` and `reject`

```json
{ "type": "accept", "eventId": "evt_4", "variant": "b", "page": {} }
{ "type": "reject", "eventId": "evt_4", "page": {} }
```

`eventId` is the event whose variants are being decided. Run the crisp-variants pick phase (accept) or revert (reject).

## Responses

```json
{ "id": "res_5", "seq": 5, "ts": "...", "eventId": "evt_4", "kind": "variants", "variants": ["a", "b", "c"], "note": "b quieter type, c split layout" }
```

| `kind` | CLI | Overlay shows |
|---|---|---|
| `variants` | `crisp live respond evt_4 --variants a,b,c [--note ...]` | Variant strip: one button per id (sets `?variant=` and reloads), Accept, Reject |
| `done` | `crisp live respond evt_4 --done [--note ...]` | A short "Done" message |
| `error` | `crisp live respond evt_4 --error --note ...` | "Your agent could not finish" with the note |

Variant ids are single letters `a` to `e`, at most 5, matching the crisp-variants switcher.

## HTTP endpoints (127.0.0.1 only)

| Method and path | Token | Purpose |
|---|---|---|
| `GET /overlay.js` | no | The overlay with port and token filled in. Refused when the Referer is not a localhost page |
| `POST /events` | yes | Overlay posts an event (2 MB body cap). 400 for an unknown `type` |
| `GET /events?since=<seq>` | yes | `{ events (summaries), responses, pending, lastSeq }` newer than `seq` |
| `POST /claim` | yes | Claim the oldest pending event (what `crisp live next` calls); 204 when none |
| `POST /responses` | yes | Agent posts a response; 404 for an unknown `eventId` |
| `GET /health` | yes | `{ ok, port, pid }` |
| `POST /shutdown` | yes | Stops the bridge (what `crisp live stop` calls) |

The token travels in the `X-Crisp-Token` header. CORS answers only `localhost`, `127.0.0.1`, `[::1]`, and `*.localhost` origins plus any `--allow-origin`; the Host header must be `127.0.0.1:<port>` or `localhost:<port>`.
