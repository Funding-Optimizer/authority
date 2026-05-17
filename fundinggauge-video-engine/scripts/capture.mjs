/* ═══════════════════════════════════════════════════════════════════
   capture.mjs — deterministic frame capture for FUNDINGGAUG≡™ scenes
   Steps window.__render(ms) frame-by-frame and screenshots each frame,
   so output is identical regardless of host speed.

   CLI:  node capture.mjs --scene=../scenes/x.html --out=frames \
                          --width=1920 --height=1080 --fps=30 --duration=60
   Also exported as captureScene() for use by render.mjs.
   ═══════════════════════════════════════════════════════════════════ */
import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export async function captureScene({scene, out, width, height, fps = 30, duration = 60, label = ''}) {
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
  await page.goto('file://' + sceneFile + '?render=1', {waitUntil: 'load'});
  await page.waitForFunction('window.__ready===true', {timeout: 20000});

  const frames = Math.round(duration * fps);
  const t0 = Date.now();
  for (let i = 0; i < frames; i++) {
    const t = (i / fps) * 1000;
    await page.evaluate(ms => window.__render(ms), t);
    await page.screenshot({
      path: path.join(outDir, String(i).padStart(5, '0') + '.jpg'),
      type: 'jpeg', quality: 95, optimizeForSpeed: true, captureBeyondViewport: false,
    });
    if (i % 90 === 0 || i === frames - 1) {
      const pct = (((i + 1) / frames) * 100).toFixed(0);
      console.log(`  [${label}] frame ${i + 1}/${frames} (${pct}%)`);
    }
  }
  await browser.close();
  console.log(`  [${label}] captured ${frames} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  return {frames, fps, outDir};
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
    out: A.out,
    width: +A.width,
    height: +A.height,
    fps: +(A.fps || 30),
    duration: +(A.duration || 60),
    label: A.label || 'capture',
  });
}
