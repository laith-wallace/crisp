# Colour Strategy & Font Selection - `/crisp-design-eng` reference

Load this file when the work involves picking or reviewing colours or typefaces. The rules here are binding, not advisory.

---

## Color Strategy Framework

Color decisions made after implementation has started are corrective, not intentional. Make the strategy decision first.

### Step 1 - Pick a commitment level

| Level | What it means | When to use |
|-------|---------------|-------------|
| **Restrained** | One accent colour on ≤10% of screen | Product UIs where content is the focus; data-dense dashboards |
| **Committed** | Accent on 30–60% of the screen | Consumer apps; product surfaces that need warmth or energy |
| **Full palette** | 3–4 colour roles (primary, secondary, tertiary, neutral) | Brand surfaces; marketing pages with multiple sections |
| **Drenched** | The surface IS the colour | Hero moments, onboarding splash, celebratory states |

Restrained is not a safe default - it is a deliberate choice.

### Step 2 - Write the scene sentence

One sentence of physical context: who uses this, where, what light, what mood. The sentence must force the dark-vs-light decision by itself. If the product category alone predicts the palette, the scene sentence is not specific enough.

**Weak:** "An analytics dashboard." (predicts: dark mode, blue)

**Strong:** "A finance analyst reviewing end-of-quarter risk exposure on a 27-inch monitor in a trading floor at 6am." (forces: dark mode, high contrast, dense, no decorative colour)

If you cannot write a scene sentence that forces the dark/light decision, surface this as a gap before making colour decisions.

### Step 3 - Color rules

- **OKLCH for all new colour values.** `oklch(0.65 0.18 142)` not `#4caf50`. OKLCH is perceptually uniform - equal steps in lightness look equal. sRGB hex is forbidden for new tokens.
- **Never pure black or pure white.** Always tint neutrals. Dark backgrounds: `oklch(10% 0.01 240)`. Light backgrounds: `oklch(98% 0.005 90)`.
- **High chroma only at lightness extremes.** Saturated colours at middle lightness (40–60% L) are hard to use accessibly. Push chroma toward the poles.
- **Register matters:** Brand register allows typographic risk and unexpected colour decisions. Product register - colour serves clarity. Over-decoration in product is a P failure.

---

## Font Selection Doctrine

Typography shapes the emotional register before a single word is read. Most AI-assisted design reaches for the same training-data defaults. These produce output that reads as AI-generated.

### Reflex-reject font list

Do not select these without a specific, documented reason beyond "it looks polished":

> Fraunces · Newsreader · Lora · Crimson Pro · Playfair Display · Cormorant Garamond · Syne · IBM Plex Sans · IBM Plex Mono · Space Mono · Space Grotesk · Inter · DM Sans · DM Serif Display · Outfit · Plus Jakarta Sans · Instrument Sans · Instrument Serif

These are not bad fonts. They are fonts so frequently reached for by AI systems that selecting them produces a legible design signal: AI made this.

### Font selection procedure (Brand register)

1. Write three voice words as **physical objects or specific feelings** - not adjectives. "Worn leather, index card, CRT glow" - not "modern, friendly, professional."
2. List the fonts you would naturally reach for. Reject any on the reflex-reject list above.
3. Find a font by its **physical object**: the typeface you'd find on a 1970s technical manual, a museum caption card, a concert poster, a pharmaceutical insert, a shipping label. The object forces a specific, uncommon choice.
4. Reject the first pick that "looks designy." That instinct is the training-data default.
5. Cross-check: elegant ≠ serif; technical ≠ sans; warm ≠ Fraunces. The automatic association is the trap.
6. If your final pick matches your original reflex, start over.

### Font rules (Product register)

Product UIs: system fonts or a single, highly legible brand sans. No display type in UI labels. No decorative serif in form fields. Typography in product serves reading speed and hierarchy - not personality.

```css
/* Product register body - prefer system stack */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```
