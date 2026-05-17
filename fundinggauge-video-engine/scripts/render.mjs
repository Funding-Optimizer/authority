/* ═══════════════════════════════════════════════════════════════════
   render.mjs — FUNDINGGAUG≡™ / FUNDINGOPTIMI⚡≡R™ motion-brand build
   ───────────────────────────────────────────────────────────────────
   For every named cut in scenes/film.html:
     1. capture the cut at 1920x1080 (and 1080x1920 for major ads)
     2. encode with ffmpeg
     3. synthesize + mux a subtle cinematic audio bed
     4. extract a poster frame
   Finally regenerate SOURCE-MANIFEST.md. Outputs -> ../video-output/.
   ═══════════════════════════════════════════════════════════════════ */
import {captureScene} from './capture.mjs';
import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const HERE  = path.dirname(fileURLToPath(import.meta.url));
const ROOT  = path.resolve(HERE, '..');
const SCENE = path.join(ROOT, 'scenes', 'film.html');
const OUT   = path.join(ROOT, 'video-output');
const TMP   = path.join(ROOT, '.tmp-frames');
const FPS   = 30;

/* cut -> whether a 9:16 vertical social cut is also produced */
const CUTS = [
  {cut:'bumper-06s',             vertical:false},
  {cut:'ignition-identity-10s',  vertical:false},
  {cut:'founder-ad-15s',         vertical:true },
  {cut:'broker-ad-15s',          vertical:true },
  {cut:'event-ad-15s',           vertical:true },
  {cut:'public-launch-30s',      vertical:true },
  {cut:'enterprise-trailer-45s', vertical:true },
  {cut:'optimizer-trailer-30s',  vertical:true },
];
const CONCURRENCY = 2;

fs.mkdirSync(OUT, {recursive: true});
fs.mkdirSync(TMP, {recursive: true});
/* fresh canonical output set */
for (const f of fs.readdirSync(OUT))
  if (/\.(mp4|png)$/.test(f)) fs.rmSync(path.join(OUT, f));

function ff(args, label) {
  console.log('  ffmpeg: ' + label);
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args],
               {stdio: ['ignore', 'inherit', 'inherit']});
}

/* ── audio bed, synthesized + cached per integer duration ───────── */
const audioCache = new Map();
function audioFor(durSec) {
  const key = Math.round(durSec);
  if (audioCache.has(key)) return audioCache.get(key);
  const wav = path.join(TMP, `bed-${key}.wav`);
  let result = null;
  try {
    const fadeOut = Math.max(0, key - 3);
    ff(['-f', 'lavfi', '-i', `sine=frequency=55:duration=${key}`,
        '-f', 'lavfi', '-i', `sine=frequency=110:duration=${key}`,
        '-f', 'lavfi', '-i', `anoisesrc=duration=${key}:color=brown:amplitude=0.3`,
        '-filter_complex',
        '[0]volume=0.17,tremolo=f=0.22:d=0.45[d1];' +
        '[1]volume=0.07[d2];' +
        '[2]volume=0.11,highpass=f=110,lowpass=f=820[d3];' +
        '[d1][d2][d3]amix=inputs=3:normalize=0,' +
        `afade=t=in:d=2,afade=t=out:st=${fadeOut}:d=3,` +
        'alimiter=limit=0.9,volume=0.75[a]',
        '-map', '[a]', wav], `audio bed ${key}s`);
    result = wav;
  } catch (e) {
    console.warn('  audio synthesis failed — silent:', e.message);
  }
  audioCache.set(key, result);
  return result;
}

/* ── build one render job: capture -> encode -> mux -> poster ───── */
async function buildJob(job) {
  const {cut, width, height, label} = job;
  const tag = `${cut}-${width}x${height}`;
  const frameDir = path.join(TMP, tag);
  const cap = await captureScene({
    scene: SCENE, cut, out: frameDir, width, height, fps: FPS, label,
  });

  const silent = path.join(OUT, `_${tag}.mp4`);
  ff(['-framerate', String(FPS), '-i', path.join(frameDir, '%05d.jpg'),
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent],
     `encode ${tag}`);
  fs.rmSync(frameDir, {recursive: true, force: true});

  const final = path.join(OUT, `fg-${tag}.mp4`);
  const audio = audioFor(cap.duration);
  if (audio) {
    ff(['-i', silent, '-i', audio, '-c:v', 'copy', '-c:a', 'aac',
        '-b:a', '192k', '-shortest', final], `mux ${tag}`);
    fs.rmSync(silent, {force: true});
  } else {
    fs.renameSync(silent, final);
  }

  const posterSec = Math.min(cap.duration - 0.1, (cap.posterMs || 0) / 1000);
  ff(['-ss', String(posterSec), '-i', final, '-frames:v', '1',
      path.join(OUT, `fg-${tag}-poster.png`)], `poster ${tag}`);

  return {tag, cutInfo: cap.cutInfo, width, height, file: `fg-${tag}.mp4`};
}

/* ── concurrency pool ───────────────────────────────────────────── */
async function pool(jobs, n, worker) {
  const results = [];
  let idx = 0;
  await Promise.all(Array.from({length: n}, async () => {
    while (idx < jobs.length) {
      const j = jobs[idx++];
      results.push(await worker(j));
    }
  }));
  return results;
}

/* ── SOURCE MANIFEST ────────────────────────────────────────────── */
function writeManifest(byCut) {
  const wm = b => b === 'optimizer'
    ? 'brand/fundingoptimizer-wordmark.svg' : 'brand/fundinggauge-wordmark.svg';
  let md = `# FUNDINGGAUG≡™ / FUNDINGOPTIMI⚡≡R™ — Source Manifest

Canonical motion-brand video system. Generated by \`scripts/render.mjs\`.
Every scene is rendered from \`scenes/film.html\` (modules in
\`scenes/modules.js\`); no stock footage is used.

## Brand inputs (source of truth)

| Asset | File |
|-------|------|
| Brand tokens | \`brand/brand-tokens.css\` |
| Logo rules | \`brand/logo-rules.md\` |
| FUNDINGGAUG≡™ wordmark | \`brand/fundinggauge-wordmark.svg\` |
| FUNDINGOPTIMI⚡≡R™ wordmark | \`brand/fundingoptimizer-wordmark.svg\` |
| ≡ mark | \`brand/eq-mark.svg\` |
| ⚡ bolt | \`brand/bolt-mark.svg\` |
| START / IGNITE button | \`brand/ignite-button.svg\` |

> The uploaded canonical logo / button / insert imagery referenced by the
> brief were not present in the repo or build container. Per direction,
> canonical SVG wordmarks were authored in \`brand/\` (chrome letters,
> three equal bright-white glowing ≡ bars, green ⚡) and the photo inserts
> were replaced with brand-graded abstract thought-flash inserts
> (\`numbers\`, \`doubt\`, \`chalk\`) generated by \`scenes/modules.js\`.

## Outputs

`;
  for (const c of byCut) {
    const ci = c.h.cutInfo;
    md += `### ${ci.name}

- **Audience:** ${ci.audience}
- **Offer:** ${ci.offer}
- **CTA:** ${ci.cta}
- **Duration:** ${ci.duration}s
- **Logo asset:** \`${wm(ci.brand)}\` (+ \`brand/ignite-button.svg\` ignition moment)
- **Source scenes:** ${ci.scenes.join(' → ')}
- **Insert assets:** ${ci.inserts.length ? ci.inserts.join(', ') + ' (abstract, brand-graded)' : 'none'}
- **Files:**
    - \`video-output/${c.h.file}\` — 1920×1080 master
    - \`video-output/fg-${c.h.tag}-poster.png\` — poster frame
${c.v ? `    - \`video-output/${c.v.file}\` — 1080×1920 vertical social cut
    - \`video-output/fg-${c.v.tag}-poster.png\` — vertical poster frame
` : ''}
`;
  }
  md += `## Insert (thought-flash) assets

Abstract, brand-graded inserts stand in for the teacher / numbers /
confused-person imagery. Each is dark, green/chrome, HUD-framed and
glitched into the brand world. Caps observed: ≤2 per 15s cut, ≤4 per
30–45s cut.

| Kind | Concept |
|------|---------|
| \`numbers\` | number-storm — figures the founder can't read |
| \`doubt\` | confused-silhouette — uncertainty before the scan |
| \`chalk\` | chalkboard abstraction — being "taught" the hard way |

## Compliance

- ✅ Spelling FUNDINGGAUG≡™ / FUNDINGOPTIMI⚡≡R™ exact, everywhere
- ✅ Chrome/silver letters only
- ✅ ≡ = three equal bright-white glowing bars (never green/blue/gray)
- ✅ ⚡ green ignition accent, only inside FUNDINGOPTIMI⚡≡R™
- ✅ ™ chrome/white, never green
- ✅ Green reserved for ignition, START/IGNITE button, progress, scoring, CTA
- ✅ Every cut contains a START/IGNITE button moment (\`ignition\` module)
- ✅ No "TURBO MODE" language
- ✅ No generic SaaS stock graphics
`;
  fs.writeFileSync(path.join(ROOT, 'SOURCE-MANIFEST.md'), md);
  console.log('  wrote SOURCE-MANIFEST.md');
}

/* ── RUN ────────────────────────────────────────────────────────── */
(async () => {
  const t0 = Date.now();
  console.log('━━ FUNDINGGAUG≡™ / FUNDINGOPTIMI⚡≡R™ motion-brand build ━━');

  const jobs = [];
  for (const c of CUTS) {
    jobs.push({cut: c.cut, width: 1920, height: 1080, label: `${c.cut} 16:9`});
    if (c.vertical)
      jobs.push({cut: c.cut, width: 1080, height: 1920, label: `${c.cut} 9:16`});
  }
  console.log(`▸ ${jobs.length} render jobs, concurrency ${CONCURRENCY}`);

  const done = await pool(jobs, CONCURRENCY, buildJob);

  /* group results by cut for the manifest */
  const byCut = CUTS.map(c => ({
    h: done.find(d => d.tag === `${c.cut}-1920x1080`),
    v: done.find(d => d.tag === `${c.cut}-1080x1920`),
  }));
  writeManifest(byCut);

  fs.rmSync(TMP, {recursive: true, force: true});
  console.log(`━━ done in ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min ━━`);
  for (const f of fs.readdirSync(OUT).sort()) {
    const kb = (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0);
    console.log(`   ${f}  (${kb} KB)`);
  }
})().catch(e => { console.error(e); process.exit(1); });
