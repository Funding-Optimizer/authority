# Logo Usage Rules — FUNDINGGAUG≡™ / FUNDINGOPTIMI⚡≡R™

Canonical, non-negotiable. Every scene and every export must comply.

## Canonical assets (source of truth)

| File | What it is |
|------|------------|
| `fundinggauge-wordmark.svg` | full FUNDINGGAUG≡™ lockup |
| `fundingoptimizer-wordmark.svg` | full FUNDINGOPTIMI⚡≡R™ lockup |
| `eq-mark.svg` | the ≡ mark in isolation |
| `bolt-mark.svg` | the ⚡ ignition bolt in isolation |
| `ignite-button.svg` | the recurring START / IGNITE button |

These SVGs are the only source of truth. Do **not** recreate the logos
independently. In motion scenes the wordmark is composed from the same
canonical structure (below) so the ≡ bars can be individually animated and
glow-controlled; the geometry, colours and proportions match these SVGs.

## Spelling — exact, always

- `FUNDINGGAUG≡™` — never "Fundinggauge", "FUNDING GAUGE", "FundingGauge".
- `FUNDINGOPTIMI⚡≡R™` — never "Funding Optimizer", "FUNDINGOPTIMIZER".
- The ≡ replaces the final **E**. The ⚡ replaces the **Z**.

## The ≡ mark

1. Always **three equal bright-white glowing bars**.
2. Equal width, equal height, equal gap — never uneven.
3. Always bright white (`#ffffff`) with a white glow.
4. Never green, never blue, never gray.
5. Never stretched, never resized inconsistently relative to the letters.
6. Never blurred into mush — the glow is additive; the bars stay crisp.
7. Never replaced with a text glyph (`≡`, `=`, "E") — use the bars.

## The ⚡ bolt

1. Appears **only** inside FUNDINGOPTIMI⚡≡R™.
2. Always the **green ignition accent** (`#2bff88` gradient + green glow).
3. Never white, never chrome — the bolt is the one green letterform.

## The ™

- Always chrome / white (`--fg-chrome` gradient). **Never green.**

## Chrome letters

- All letters are chrome/silver only (`--fg-chrome-gradient`).
- No green letters. No coloured letters.

## Colour discipline

Green (`--fg-green`) is reserved for: ignition, the START/IGNITE button,
progress, scoring, approval glow, CTA states, and the ⚡ bolt. It is never
used for chrome letters, the ≡ mark, or the ™.

## Canonical motion wordmark structure

```html
<!-- FUNDINGGAUG≡™ -->
<span class="fg-wordmark">
  <span class="fg-chrome">FUNDINGGAUG</span>
  <span class="fg-eq"><i></i><i></i><i></i></span>
  <span class="fg-tm">™</span>
</span>

<!-- FUNDINGOPTIMI⚡≡R™ -->
<span class="fg-wordmark">
  <span class="fg-chrome">FUNDINGOPTIMI</span>
  <span class="fg-bolt"><!-- bolt-mark.svg --></span>
  <span class="fg-eq"><i></i><i></i><i></i></span>
  <span class="fg-chrome">R</span>
  <span class="fg-tm">™</span>
</span>
```

`scenes/modules.js → buildWordmark()` emits exactly this structure and is
the only place wordmarks are created.

## Prohibited

- No "TURBO MODE" language anywhere.
- No generic SaaS stock graphics.
- No recolouring, no outline-only logos, no drop-shadow-only "ghost" logos.
