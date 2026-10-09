# Art Direction - `/crisp-funnel` reference

Load this file in build mode before any HTML is assembled, and in critique mode when the page looks generic. The rules are binding.

The kit gives a funnel its **structure**: section order, primitives, interaction behaviour. It does not give a client its **skin**. The kit ships in the CRISP brand skin (near-black `#080808`, lime `#c8ff3c`, DM Serif Display, Outfit). Copying that skin onto a client page is the most common failure of this skill: every build comes out black and lime, and every client looks like CRISP.

## Contents

- The skin rule
- Step 1 - Write the art direction
- Step 2 - Pick one aesthetic lane
- Step 3 - Derive the palette from the client
- Step 4 - Pick the type
- Step 5 - Check it against past builds
- Step 6 - Swap the skin tokens
- Step 7 - Award pass
- Art direction pre-flight

## The skin rule

Keep from the kit: section structure, spacing scale, motion tokens (`--ease`), interaction behaviour, accessibility behaviour.

Replace for every client: `--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-mid`, `--text-muted`, `--accent`, `--accent-fill`, `--ink`, `--err`, `--font-headline`, `--font-body`, `--font-mono`, `--r-sm`, `--r-base`, `--r-lg`, and the Google Fonts `<link>`.

The CRISP skin is allowed only when the client is CRISP or FlowConverts.

## Step 1 - Write the art direction

Write three lines before any code. The full rules are in `/crisp-design-eng` `references/award-level-landing.md`, Step 1.

1. **Scene sentence** - who visits, where, on what device, in what mood. It must force light or dark by itself.
2. **Concept** - one sentence naming the one idea the page is built around. "A clinic intake that reads like a pharmacy label" is a concept. "Modern and clean" is not.
3. **Signature moment** - the one thing a visitor will remember.

If the brief does not give enough to write the scene sentence, ask for brand assets (logo, colours, photography, a site they admire) in the one question Step 1 of build mode allows.

## Step 2 - Pick one aesthetic lane

Pick the lane the scene sentence and the audience point to. Name it in the build plan with a one-line reason. "It looks premium" is not a reason.

| Lane | Background | Colour behaviour | Type | Motion | Fits |
|---|---|---|---|---|---|
| **Swiss / grid** | Light, flat | One strong accent, lots of white | Grotesk display, tight grid | Minimal, precise | Professional services, B2B, finance |
| **Editorial / magazine** | Light, paper tint | Ink plus one spot colour | Big display face, varied scale | Reveal on scroll | Content, education, consultancy |
| **Organic / natural** | Warm light or mid tone | Earth, plant, clay tones | Soft humanist faces | Slow, eased | Wellness, food, sustainability, care |
| **Luxury / quiet** | Light or deep tone (not black) | Two or three colours, no saturated accent | High-contrast serif or refined sans | Very slow, sparse | Premium products, property, high-ticket |
| **Bold / maximal** | Saturated colour field | Full palette, colour blocks | Heavy display, huge scale | Energetic, layered | Consumer brands, events, youth |
| **Brutalist / raw** | Flat, often light | High contrast, one or two colours | System or mono faces on purpose | None or abrupt | Art, fashion, contrarian brands |
| **Retro / era-specific** | Era-led (print cream, CRT dark, 70s tones) | Period palette | Period display face | Era-true (scanlines, print grain) | Gaming, creative tools, nostalgia products |
| **Industrial / technical** | Mid grey or light | Safety colours, signal accents | Condensed or technical faces | Mechanical, stepped | Trades, engineering, logistics, dev tools |
| **Playful / toy** | Bright light | Primary or candy colours | Rounded, chunky faces | Bouncy only where state changes | Kids, consumer apps, community |

Rules:

- One lane per page. Do not blend two.
- Dark backgrounds are allowed only when the scene sentence forces dark. "It looks techy" does not force dark.
- Editorial (italic serif plus mono labels plus rules) is a slop tell when it is the default. Pick it only with a reason from the brief.

## Step 3 - Derive the palette from the client

Take colour from the client, in this order:

1. The client's existing brand colours (logo, site, packaging, signage, uniforms).
2. The product or place itself (the material, the food, the landscape, the building).
3. The audience's world (the colours of the place they will be when they read the page).

Then:

- Pick a commitment level from `/crisp-design-eng` `references/color-typography.md` Step 1. Marketing pages are usually Committed or Full palette.
- Write every token in OKLCH. No pure black or pure white.
- Keep one accent for actions only. The CTA label passes 4.5:1 on its fill.

**Banned defaults for client work** (each one is a fail unless the client's own brand uses it):

| Default | How to spot it |
|---|---|
| Black and acid green | Background lightness under 20% and an accent with hue 100-150, chroma over 0.15 (lime, neon green, acid green) |
| Purple-blue gradient | Any purple or indigo to blue gradient |
| Cream and generic sans | Untinted off-white with Inter, Geist, Roboto or DM Sans |
| Black and one neon | Background lightness under 20% and any single neon accent, when the scene sentence does not force dark |

## Step 4 - Pick the type

Use the font procedure in `/crisp-design-eng` `references/color-typography.md`. The reflex-reject list is binding. The kit's own fonts (DM Serif Display, DM Mono, Outfit) are on it, so never carry them over to a client page.

- One display face with real character, one quiet text face. A mono face only if the lane needs it.
- Hero headline: `clamp()` from 2.5rem on a 375px phone to 5rem or more on desktop.
- Type scale ratio of 1.333 or more between levels.

## Step 5 - Check it against past builds

The aim is that no two client pages look alike. Keep a log at `~/.crisp/art-direction-log.md`. Create the folder and file if they are missing. One line per build:

```
- YYYY-MM-DD | <client> | <lane> | bg <oklch> | accent <oklch> | display <font>
```

Before you swap the skin, read the last 5 lines. The new build must differ from each of them on at least 2 of these 4:

1. Lane.
2. Background band: dark (lightness under 30%), mid (30-85%), or light (over 85%).
3. Accent hue, by 60 degrees or more.
4. Display font.

If it does not, go back to Step 2. After the build passes, append its line. A rebuild for the same client may match that client's earlier line.

## Step 6 - Swap the skin tokens

Replace every token named in "The skin rule" with the values from Steps 3 and 4. Swap the Google Fonts `<link>` too. Then search the assembled file:

- 0 matches for `c8ff3c`, `080808`, `DM Serif Display`, `DM Mono`, `Outfit`.
- 0 class names or comments that still say `lime`.

## Step 7 - Award pass

Every landing page is built to the Awwwards bar unless the user says it is a quick draft. After the Mechanical Pre-Flight Checks, run the **Award Pre-Flight (A1-A10)** in `/crisp-design-eng` `references/award-level-landing.md`. Report it as one line: `Award pre-flight: N/10 pass`, then each failure with its fix.

Pipeline drafts fail A3 (real content) and A9 (live and indexable) on purpose until a human adds real proof and moves the page to the client's domain. Say so; do not hide it.

## Art direction pre-flight

All six must pass before the page is shown to the client.

| # | Check | Pass condition |
|---|---|---|
| D1 | Art direction written | Scene sentence, concept and signature moment appear in the build plan |
| D2 | Lane named | Exactly 1 lane, with a reason taken from the brief |
| D3 | Skin swapped | 0 matches for the CRISP skin strings in Step 6 (client is not CRISP) |
| D4 | No banned default | 0 banned defaults from Step 3 |
| D5 | Different from past builds | Differs from each of the last 5 log lines on 2 or more of the 4 axes |
| D6 | Fonts allowed | 0 reflex-reject fonts, or the reason is written in the build plan |
