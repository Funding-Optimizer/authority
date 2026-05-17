# FUNDINGGAUG≡™ — Launch Video Source Manifest

Documents the provenance of every scene in the launch video asset system.

## Important provenance note

The task referenced these source assets:

- `fundinggauge-cinematic-v12` HTML
- `FUNDINGGAUGE-ULTIMATE-STANDALONE` HTML
- partner briefing poster
- existing FUNDINGGAUGE logo / wordmark
- prior `.mp4` renders in `fundinggauge-video-engine/video-output/`

**None of these were present** in this repository or anywhere on the build
container. The repository contained only a React/Vite template plus one
HTML landing page for the sibling brand **CREDIT$TACK≡R™**
(`public/index.html`) and `public/creditstacker-logo.png`.

To avoid rebuilding the visual language from scratch, the cinematic scene
file was authored by **adapting the locked liquid-glass design spec** found
in `public/index.html` — the same carbon/glass/HUD token system, retuned to
the canonical FUNDINGGAUG≡™ brand rules (chrome wordmark; green reserved for
ignition / glow / progress / CTA; black carbon fiber; HUD; hypercar
ignition). When the real `fundinggauge-cinematic-v12` /
`FUNDINGGAUGE-ULTIMATE-STANDALONE` HTML files are added to `scenes/`, the
same pipeline (`scripts/render.mjs`) re-renders against them unchanged.

## Scene → source map

| Time | Scene | Content | Source asset | Reused / authored |
|------|-------|---------|--------------|-------------------|
| 0–3s | Logo flicker | black → chrome FUNDINGGAUG≡™ flicker | `scenes/fundinggauge-cinematic.html` §S1 | Authored; chrome wordmark + grain/vignette tokens adapted from `public/index.html` liquid-glass spec |
| 3–7s | System Ready / Ignite | SYSTEM READY label, IGNITE button pulse, ignition rings | `scenes/fundinggauge-cinematic.html` §S2 | Authored; ignition / pulse behaviour modeled on the intended `FUNDINGGAUGE-ULTIMATE-STANDALONE` ignition source |
| 7–12s | Boot sequence | lender matrix, risk algorithms, tier database, scanner online | `scenes/fundinggauge-cinematic.html` §S3 | Authored; HUD boot rows + progress bars |
| 12–20s | Gauge sweep | "Check your fundability." gauge needle + green arc | `scenes/fundinggauge-cinematic.html` §S4 | Authored; SVG gauge, green progress = brand "progress" accent |
| 20–30s | Proof cards | 47-second fundability · 500+ lenders · zero credit impact · funding stack blueprint | `scenes/fundinggauge-cinematic.html` §S5 | Authored; liquid-glass cards adapted from `public/index.html` glass panels |
| 30–42s | Partner use cases | brokers · lenders · franchisors · events | `scenes/fundinggauge-cinematic.html` §S6 | Authored; partner-briefing-poster aesthetic reference |
| 42–52s | CTA | "Launch FUNDINGGAUG≡™ in your funnel." | `scenes/fundinggauge-cinematic.html` §S7 | Authored; green CTA state |
| 52–60s | End card | FUNDINGGAUG≡™ / fundinggauge.com | `scenes/fundinggauge-cinematic.html` §S8 | Authored; final lockup / end card |

All scenes live in a single deterministic HTML file so capture is
frame-reproducible (`window.__render(ms)` is a pure function of time).

## Audio

No audio source asset was supplied. `scripts/render.mjs` synthesizes a
subtle cinematic bed with ffmpeg (`sine` sub-drone + filtered brown noise,
faded in/out, limited). To use a real track instead, drop it in and mux
over the `_*_silent.mp4` intermediate.

## Deliverables → output files

| # | Deliverable | Output file | Built from |
|---|-------------|-------------|------------|
| 1 | 1920×1080 master | `video-output/fundinggauge-master-1920x1080.mp4` | full 60s capture @ 1920×1080 |
| 2 | 1080×1920 vertical master | `video-output/fundinggauge-master-1080x1920.mp4` | full 60s capture @ 1080×1920 |
| 3 | 6s bumper | `video-output/fundinggauge-06s-bumper.mp4` | master cut [54–60s] — end card |
| 4 | 10s ignition cut | `video-output/fundinggauge-10s-ignition.mp4` | master cut [0–10s] — logo → ignite → boot |
| 5 | 15s partner ad | `video-output/fundinggauge-15s-partner-ad.mp4` | master cut [30–45s] — partners → CTA |
| 6 | 30s launch cut | `video-output/fundinggauge-30s-launch.mp4` | master cut [0–30s] — logo → proof |
| 7 | Poster frame PNG | `video-output/fundinggauge-poster-frame.png` | master frame @ 17s — gauge hero |
| 8 | Source manifest | `SOURCE-MANIFEST.md` | this file |

## Brand compliance checklist

- ✅ Brand spelling FUNDINGGAUG≡™ only
- ✅ Chrome / silver wordmark (CSS metallic gradient, `.chrome`)
- ✅ Green used only for ignition accents, glow, progress, CTA states
- ✅ Black carbon fiber, liquid glass, HUD, hypercar ignition aesthetic
- ✅ No "TURBO MODE" copy anywhere
- ✅ No generic SaaS stock-video footage — 100% rendered HTML scene
