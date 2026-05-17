/* ═══════════════════════════════════════════════════════════════════
   capture.mjs — deterministic frame capture for the FUNDINGGAUG≡™ /
   FUNDINGOPTIMI⚡≡R™ film harness.
   Steps window.__render(ms) frame-by-frame and screenshots each frame,
   so output is identical regardless of host speed.

   CLI:  node capture.mjs --scene=../scenes/film.html --cut=bumper-06s \
                          --out=frames --width=1920 --height=1080 --fps=30
   Also exported as captureScene() for use by render.mjs.
   ═══════════════════════════════════════════════════════════════════ */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function captureScene({scene, cut, out, width, height, fps = 30, duration = null, label = ''}) {
  const sceneFile = path.resolve(scene);
  const outDir = path.resolve(out);
  fs.rmSync(outDir, {recursive: true, force: true});
  fs.mkdirSync(outDir, {recursive: true});

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars',
           '--force-color-profile=srgb', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({width, height, deviceScaleFactor: 1});
  const url = 'file://' + sceneFile + '?render=1' + (cut ? '&cut=' + cut : '');
  await page.goto(url, {waitUntil: 'load'});
  await page.waitForFunction('window.__ready===true', {timeout: 20000});

  /* the film harness is the single source of truth for cut metadata */
  const meta = await page.evaluate(() => ({
    duration: window.__duration,
    posterMs: window.__posterMs,
    cutInfo: window.__cutInfo,
  }));
  const dur = duration != null ? duration : meta.duration;

  const frames = Math.round(dur * fps);
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const t = (i / fps) * 1000;
    await page.evaluate(ms => window.__render(ms), t);
    await page.screenshot({
      path: path.join(outDir, String(i).padStart(5, '0') + '.jpg'),
      type: 'jpeg', quality: 95, optimizeForSpeed: true, captureBeyondViewport: false,
    });
    if (i % 120 === 0 || i === frames - 1) {
      const pct = (((i + 1) / frames) * 100).toFixed(0);
      console.log(`  [${label}] frame ${i + 1}/${frames} (${pct}%)`);
    }
  }
  await browser.close();
  console.log(`  [${label}] captured ${frames} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return {frames, fps, outDir, duration: dur, posterMs: meta.posterMs, cutInfo: meta.cutInfo};
}

/* ── CLI entrypoint ─────────────────────────────────────────────── */
const isCLI = import.meta.url === 'file://' + process.argv[1];
if (isCLI) {
  const A = Object.fromEntries(process.argv.slice(2).map(s => {
    const [k, v] = s.split('=');
    return [k.replace(/^--/, ''), v];
  }));
  await captureScene({
    scene: A.scene,
    cut: A.cut,
    out: A.out,
    width: +A.width,
    height: +A.height,
    fps: +(A.fps || 30),
    duration: A.duration ? +A.duration : null,
    label: A.label || A.cut || 'capture',
  });
}
