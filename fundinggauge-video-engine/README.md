# FUNDINGGAUG≡™ Launch Video Engine

A deterministic HTML → video pipeline that renders the FUNDINGGAUG≡™
cinematic launch master and all derivative cuts.

## Layout

```
fundinggauge-video-engine/
├── scenes/
│   └── fundinggauge-cinematic.html   60s deterministic cinematic scene
├── scripts/
│   ├── capture.mjs                   frame-stepped Puppeteer capture
│   └── render.mjs                    full build pipeline
├── video-output/                     all rendered deliverables
├── SOURCE-MANIFEST.md                scene → asset provenance
└── README.md
```

## How it works

`scenes/fundinggauge-cinematic.html` drives every visual from a single pure
function, `window.__render(ms)`. Opened normally it autoplays a live
preview; opened with `?render=1` it exposes the seek function so the
capture script can step it frame-by-frame. This makes renders 100%
reproducible regardless of host speed.

`render.mjs`:

1. Captures the scene at 1920×1080 and 1080×1920 (30 fps, 60s).
2. Encodes each with ffmpeg (libx264, CRF 18, yuv420p).
3. Synthesizes a subtle cinematic audio bed and muxes it in.
4. Cuts the 6s / 10s / 15s / 30s derivatives from the 16:9 master.
5. Extracts the poster-frame PNG.

## Build

```bash
cd fundinggauge-video-engine
npm install
npx puppeteer browsers install chrome   # one-time
node scripts/render.mjs
```

Requires `ffmpeg` on `PATH`. Outputs land in `video-output/`.

## Single capture (manual)

```bash
node scripts/capture.mjs \
  --scene=scenes/fundinggauge-cinematic.html \
  --out=.frames --width=1920 --height=1080 --fps=30 --duration=60
```

## Editing scenes

Scene timings live in the `SC` table and the per-scene blocks of the
`render()` function in `fundinggauge-cinematic.html`. To swap in the
canonical `fundinggauge-cinematic-v12` / `FUNDINGGAUGE-ULTIMATE-STANDALONE`
HTML, place them in `scenes/` exposing the same `window.__render(ms)` /
`window.__ready` contract and point `render.mjs` at them — no other change
needed.

See `SOURCE-MANIFEST.md` for brand rules and provenance.
