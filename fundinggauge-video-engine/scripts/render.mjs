/* ═══════════════════════════════════════════════════════════════════
   render.mjs — FUNDINGGAUG≡™ launch video build pipeline
   ───────────────────────────────────────────────────────────────────
   1. Capture the 60s cinematic scene at 1920x1080 and 1080x1920.
   2. Encode both with ffmpeg into master videos.
   3. Synthesize a subtle cinematic audio bed and mux it in.
   4. Cut the 6s / 10s / 15s / 30s derivatives from the 16:9 master.
   5. Extract the poster-frame PNG.
   All outputs land in ../video-output/.
   ═══════════════════════════════════════════════════════════════════ */
import {captureScene} from './capture.mjs';
import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const HERE   = path.dirname(fileURLToPath(import.meta.url));
const ROOT   = path.resolve(HERE, '..');
const SCENE  = path.join(ROOT, 'scenes', 'fundinggauge-cinematic.html');
const OUT    = path.join(ROOT, 'video-output');
const TMP    = path.join(ROOT, '.tmp-frames');
const FPS    = 30;
const DUR    = 60;

fs.mkdirSync(OUT, {recursive: true});

function ff(args, label) {
  console.log('  ffmpeg: ' + label);
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...args],
               {stdio: ['ignore', 'inherit', 'inherit']});
}

/* ── 1+2. CAPTURE + ENCODE ──────────────────────────────────────── */
function encodeMaster(name, frameDir, width, height) {
  const silent = path.join(OUT, `_${name}_silent.mp4`);
  ff(['-framerate', String(FPS), '-i', path.join(frameDir, '%05d.jpg'),
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent],
     `encode ${name} (${width}x${height})`);
  fs.rmSync(frameDir, {recursive: true, force: true});
  return silent;
}

/* ── 3. AUDIO BED (synthesized — no source track supplied) ──────── */
function buildAudio() {
  const wav = path.join(TMP, 'bed.wav');
  fs.mkdirSync(TMP, {recursive: true});
  try {
    ff(['-f', 'lavfi', '-i', `sine=frequency=55:duration=${DUR}`,
        '-f', 'lavfi', '-i', `sine=frequency=110:duration=${DUR}`,
        '-f', 'lavfi', '-i', `anoisesrc=duration=${DUR}:color=brown:amplitude=0.3`,
        '-filter_complex',
        '[0]volume=0.17,tremolo=f=0.22:d=0.45[d1];' +
        '[1]volume=0.07[d2];' +
        '[2]volume=0.11,highpass=f=110,lowpass=f=820[d3];' +
        '[d1][d2][d3]amix=inputs=3:normalize=0,' +
        'afade=t=in:d=2.5,afade=t=out:st=57:d=3,' +
        'alimiter=limit=0.9,volume=0.75[a]',
        '-map', '[a]', wav], 'synthesize audio bed');
    return wav;
  } catch (e) {
    console.warn('  audio synthesis failed — videos will be silent:', e.message);
    return null;
  }
}

/* mux audio into a silent master; returns final path */
function mux(silent, audio, finalName) {
  const final = path.join(OUT, finalName);
  if (audio) {
    ff(['-i', silent, '-i', audio,
        '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', final],
       `mux audio -> ${finalName}`);
  } else {
    fs.copyFileSync(silent, final);
  }
  fs.rmSync(silent, {force: true});
  return final;
}

/* ── 4. DERIVATIVE CUTS (single-segment trims of the 16:9 master) ─ */
const CUTS = [
  {name: 'fundinggauge-06s-bumper.mp4',     start: 54, len: 6 },
  {name: 'fundinggauge-10s-ignition.mp4',   start: 0,  len: 10},
  {name: 'fundinggauge-15s-partner-ad.mp4', start: 30, len: 15},
  {name: 'fundinggauge-30s-launch.mp4',     start: 0,  len: 30},
];
function buildCuts(master) {
  for (const c of CUTS) {
    const fadeAt = Math.max(0, c.len - 0.4);
    ff(['-ss', String(c.start), '-i', master, '-t', String(c.len),
        '-vf', `fade=in:0:8,fade=out:st=${fadeAt}:d=0.4`,
        '-af', `afade=t=in:d=0.25,afade=t=out:st=${fadeAt}:d=0.4`,
        '-c:v', 'libx264', '-preset', 'medium', '-crf', '19',
        '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k',
        '-movflags', '+faststart', path.join(OUT, c.name)],
       `cut ${c.name}`);
  }
}

/* ── 5. POSTER FRAME ────────────────────────────────────────────── */
function buildPoster(master) {
  ff(['-ss', '17', '-i', master, '-frames:v', '1',
      path.join(OUT, 'fundinggauge-poster-frame.png')], 'poster frame @17s');
}

/* ── RUN ────────────────────────────────────────────────────────── */
(async () => {
  const t0 = Date.now();
  console.log('━━ FUNDINGGAUG≡™ launch video build ━━');

  const audio = buildAudio();

  console.log('▸ capturing 1920x1080 + 1080x1920 in parallel');
  const hDir = path.join(TMP, 'master-1920x1080');
  const vDir = path.join(TMP, 'master-1080x1920');
  await Promise.all([
    captureScene({scene: SCENE, out: hDir, width: 1920, height: 1080,
                  fps: FPS, duration: DUR, label: '16:9'}),
    captureScene({scene: SCENE, out: vDir, width: 1080, height: 1920,
                  fps: FPS, duration: DUR, label: '9:16'}),
  ]);

  console.log('▸ encoding masters');
  const mSilent = encodeMaster('master-1920x1080', hDir, 1920, 1080);
  const vSilent = encodeMaster('master-1080x1920', vDir, 1080, 1920);
  const master  = mux(mSilent, audio, 'fundinggauge-master-1920x1080.mp4');
  mux(vSilent, audio, 'fundinggauge-master-1080x1920.mp4');

  console.log('▸ derivative cuts');
  buildCuts(master);

  console.log('▸ poster frame');
  buildPoster(master);

  fs.rmSync(TMP, {recursive: true, force: true});
  console.log(`━━ done in ${((Date.now() - t0) / 1000 / 60).toFixed(1)} min ━━`);
  for (const f of fs.readdirSync(OUT).sort()) {
    const kb = (fs.statSync(path.join(OUT, f)).size / 1024).toFixed(0);
    console.log(`   ${f}  (${kb} KB)`);
  }
})().catch(e => { console.error(e); process.exit(1); });
