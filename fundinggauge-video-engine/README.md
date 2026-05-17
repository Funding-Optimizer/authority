# FUNDINGGAUG≡™ / FUNDINGOPTIMI⚡≡R™ — Motion-Brand Video Engine

A deterministic HTML → video system that renders the canonical
FUNDINGGAUG≡™ and FUNDINGOPTIMI⚡≡R™ launch films and every derivative
social cut from one reusable set of scene modules.

## Layout

```
fundinggauge-video-engine/
├── brand/
│   ├── brand-tokens.css            canonical colour / glow / type / timing
│   ├── logo-rules.md               exact logo usage rules
│   ├── fundinggauge-wordmark.svg    canonical FUNDINGGAUG≡™ lockup
│   ├── fundingoptimizer-wordmark.svg canonical FUNDINGOPTIMI⚡≡R™ lockup
│   ├── eq-mark.svg                 the ≡ mark (three white bars)
│   ├── bolt-mark.svg               the ⚡ ignition bolt
│   └── ignite-button.svg           the recurring START/IGNITE button
├── scenes/
│   ├── film.html                   harness — assembles named cuts
│   ├── modules.js                  reusable scene modules + inserts
│   └── scene-styles.css            scene layout (imports brand tokens)
├── scripts/
│   ├── capture.mjs                 frame-stepped Puppeteer capture
│   └── render.mjs                  full multi-cut build pipeline
├── video-output/                   rendered deliverables
├── SOURCE-MANIFEST.md              per-output audience / offer / CTA / sources
└── README.md
```

## Scene modules (`scenes/modules.js`)

`logoBoot` · `ignition` (recurring START/IGNITE button) · `scoreGauge` ·
`stackingSequence` · `reportUnlock` · `brokerDashboard` · `eventKiosk` ·
`enterpriseGrid` · `optimizerCommand` · `endCard`, plus abstract
`inserts` (numbers / doubt / chalk thought-flashes).

Each module is `{ build(layer,opts), update(layer,lt,dur,opts) }`. `build`
runs once; `update` is a pure function of local time, so renders are 100%
reproducible. The canonical wordmarks are produced only by
`buildWordmark()` — see `brand/logo-rules.md`.

## Cuts

Defined in the `CUTS` table in `scenes/film.html`; selected with
`?cut=<name>`. Each cut is an ordered list of scene segments (always
including an `ignition` button moment) plus capped insert flashes.

| Cut | Length | 9:16 vertical |
|-----|--------|---------------|
| `bumper-06s` | 6s | — |
| `ignition-identity-10s` | 10s | — |
| `founder-ad-15s` | 15s | ✓ |
| `broker-ad-15s` | 15s | ✓ |
| `event-ad-15s` | 15s | ✓ |
| `public-launch-30s` | 30s | ✓ |
| `enterprise-trailer-45s` | 45s | ✓ |
| `optimizer-trailer-30s` | 30s | ✓ |

## Build

```bash
cd fundinggauge-video-engine
npm install
npx puppeteer browsers install chrome   # one-time
node scripts/render.mjs
```

Requires `ffmpeg` on `PATH`. `render.mjs` captures every cut at 1920×1080
(and 1080×1920 for the major ads), encodes with ffmpeg, muxes a
synthesized cinematic audio bed, extracts poster frames, and regenerates
`SOURCE-MANIFEST.md`. Outputs land in `video-output/`.

## Single capture / live preview

```bash
# one cut, manual
node scripts/capture.mjs --scene=scenes/film.html --cut=founder-ad-15s \
  --out=.frames --width=1920 --height=1080 --fps=30

# live preview in a browser
open "scenes/film.html?cut=public-launch-30s"
```

See `brand/logo-rules.md` for logo rules and `SOURCE-MANIFEST.md` for the
audience / offer / CTA / source mapping of every output.
