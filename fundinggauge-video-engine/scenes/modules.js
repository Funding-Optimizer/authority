/* ═══════════════════════════════════════════════════════════════════
   modules.js — FUNDINGGAUG≡™ / FUNDINGOPTIMI⚡≡R™ reusable scene modules
   ───────────────────────────────────────────────────────────────────
   Classic script (file:// safe). Exposes window.FG.
   Every module: { build(layer,opts), update(layer,lt,dur,opts) }.
   build() runs once; update() is a pure function of local time lt (ms).
   All brand values come from brand/brand-tokens.css — never hard-coded.
   ═══════════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  /* ── helpers ──────────────────────────────────────────────────── */
  const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
  const lerp  = (a, b, t) => a + (b - a) * t;
  const easeOut   = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function hash(n){ const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  /* fade envelope */
  function env(t, a, b, fi, fo){
    if (t < a || t > b) return 0;
    return Math.min(clamp((t - a) / fi, 0, 1), clamp((b - t) / fo, 0, 1));
  }
  function mk(tag, cls, text){
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  const BOLT_SVG =
    '<svg viewBox="0 0 110 165" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M64,6 L18,92 L48,92 L40,159 L94,66 L62,66 Z"/></svg>';

  /* ── canonical wordmark builder (the only place wordmarks are made) ── */
  function eqMark(){
    const e = mk('span', 'fg-eq');
    e.innerHTML = '<i></i><i></i><i></i>';
    return e;
  }
  function buildWordmark(brand){
    const w = mk('span', 'fg-wordmark');
    if (brand === 'optimizer'){
      w.appendChild(mk('span', 'fg-chrome', 'FUNDINGOPTIMI'));
      const bolt = mk('span', 'fg-bolt'); bolt.innerHTML = BOLT_SVG;
      w.appendChild(bolt);
      w.appendChild(eqMark());
      w.appendChild(mk('span', 'fg-chrome', 'R'));
    } else {
      w.appendChild(mk('span', 'fg-chrome', 'FUNDINGGAUG'));
      w.appendChild(eqMark());
    }
    w.appendChild(mk('span', 'fg-tm', '™'));
    return w;
  }

  /* ═══ MODULE: logoBoot ════════════════════════════════════════════ */
  const logoBoot = {
    build(layer, o){
      const w = buildWordmark(o.brand || 'gauge');
      w.classList.add('sc-bootmark');
      const bar = mk('div', 'sc-boot-bar');
      layer.append(w, bar);
      layer._r = { w, bar, eqs: w.querySelectorAll('.fg-eq > i'),
                   chromes: w.querySelectorAll('.fg-chrome') };
    },
    update(layer, lt){
      const r = layer._r;
      const f = lt > 1100 ? 1 : (hash(Math.floor(lt / 80) * 3.1 + 1) > .4 ? 1 : .08);
      r.w.style.opacity = f;
      const sheen = clamp((lt - 900) / 1600, 0, 1);
      r.chromes.forEach(c => c.style.backgroundPositionX = (150 - sheen * 210) + '%');
      const fl = env(lt, 850, 1900, 320, 600);
      r.eqs.forEach(i => i.style.boxShadow =
        '0 0 ' + (4 + fl * 12) + 'px #fff,0 0 ' + (13 + fl * 30) + 'px rgba(255,255,255,.9)');
      const g = easeOut(clamp((lt - 1450) / 760, 0, 1));
      r.bar.style.width = (g * 42) + 'vmin';
      r.bar.style.opacity = clamp((lt - 1450) / 360, 0, 1);
    },
  };

  /* ═══ MODULE: ignition — recurring START/IGNITE button trigger ════ */
  const ignition = {
    build(layer, o){
      const kicker = mk('div', 'fg-kicker sc-ig-kicker', o.label || 'System Ready');
      const btn = mk('button', 'fg-btn sc-ig-btn', 'IGNITE');
      const ring = mk('span', 'fg-btn-ring'); btn.appendChild(ring);
      const ring2 = mk('span', 'fg-btn-ring sc-ig-ring2'); btn.appendChild(ring2);
      const cap = mk('div', 'sc-ig-cap', o.cap || 'INITIATE FUNDABILITY SCAN');
      const flash = mk('div', 'sc-ig-flash');
      layer.append(kicker, btn, cap, flash);
      layer._r = { kicker, btn, ring, ring2, cap, flash };
    },
    update(layer, lt, dur){
      const r = layer._r, press = dur * 0.54;
      r.kicker.style.opacity = clamp(lt / 420, 0, 1);
      r.cap.style.opacity = clamp(lt / 600, 0, 1) * (lt > press ? clamp(1 - (lt - press) / 300, .15, 1) : 1);
      if (lt < press){
        const pulse = .5 + .5 * Math.sin(lt / 1000 * Math.PI * 2 * 1.1);
        r.btn.style.transform = 'scale(' + (1 + pulse * .015) + ')';
        r.btn.style.boxShadow =
          '0 0 ' + (12 + pulse * 26) + 'px rgba(43,255,136,' + (.4 + pulse * .4) + '),' +
          '0 0 ' + (34 + pulse * 46) + 'px rgba(43,255,136,' + (.14 + pulse * .22) + ')';
        const rp = ((lt / 1500) % 1 + 1) % 1;
        r.ring.style.transform = 'translate(-50%,-50%) scale(' + lerp(.7, 2.1, rp) + ')';
        r.ring.style.opacity = (1 - rp) * .55;
        r.ring2.style.opacity = 0;
        r.flash.style.opacity = 0;
      } else {
        const at = lt - press, span = dur - press;
        const dip = Math.max(0, 1 - at / 110);
        r.btn.style.transform = 'scale(' + (1 - .10 * dip) + ')';
        r.btn.style.boxShadow =
          '0 0 44px rgba(43,255,136,.95),0 0 110px rgba(43,255,136,.5)';
        const rp = easeOut(clamp(at / span, 0, 1));
        r.ring.style.transform = 'translate(-50%,-50%) scale(' + lerp(1, 4.4, rp) + ')';
        r.ring.style.opacity = (1 - rp) * .85;
        r.ring2.style.transform = 'translate(-50%,-50%) scale(' + lerp(1, 6.6, clamp(at / span * 1.4, 0, 1)) + ')';
        r.ring2.style.opacity = clamp(1 - at / span * 1.4, 0, 1) * .5;
        r.flash.style.opacity = clamp(1 - at / 300, 0, 1) * .8;
      }
    },
  };

  /* ═══ MODULE: scoreGauge ══════════════════════════════════════════ */
  const GAUGE_LEN = Math.PI * 180;
  const scoreGauge = {
    build(layer, o){
      const head = mk('div', 'fg-headline fg-chrome sc-g-head', o.headline || 'Check your fundability.');
      const wrap = mk('div', 'sc-gauge-wrap');
      let ticks = '';
      for (let i = 0; i < 21; i++){
        const ang = -90 + (i / 20) * 180;
        ticks += '<line x1="210" y1="58" x2="210" y2="' + (i % 5 === 0 ? 30 : 42) +
                 '" stroke="rgba(255,255,255,.22)" stroke-width="' + (i % 5 === 0 ? 3.4 : 2) +
                 '" transform="rotate(' + ang + ' 210 220)"/>';
      }
      wrap.innerHTML =
        '<svg class="sc-gsvg" viewBox="0 0 420 250">' +
        '<path d="M30,220 A180,180 0 0 1 390,220" fill="none" stroke="rgba(255,255,255,.10)" stroke-width="16" stroke-linecap="round"/>' +
        '<path class="sc-garc" d="M30,220 A180,180 0 0 1 390,220" fill="none" stroke="#2bff88" stroke-width="16" stroke-linecap="round" stroke-dasharray="' + GAUGE_LEN + '"/>' +
        '<g class="sc-gticks">' + ticks + '</g>' +
        '<line class="sc-gneedle" x1="210" y1="220" x2="210" y2="74" stroke="#fafcff" stroke-width="4" stroke-linecap="round"/>' +
        '<circle cx="210" cy="220" r="13" fill="#0c0f14" stroke="#2bff88" stroke-width="3"/></svg>' +
        '<div class="sc-greadout"><div class="sc-gnum fg-chrome">0</div>' +
        '<div class="sc-gverdict">SCANNING</div></div>';
      layer.append(head, wrap);
      layer._r = {
        arc: wrap.querySelector('.sc-garc'),
        needle: wrap.querySelector('.sc-gneedle'),
        ticks: [...wrap.querySelectorAll('.sc-gticks line')],
        num: wrap.querySelector('.sc-gnum'),
        verdict: wrap.querySelector('.sc-gverdict'),
        target: o.score != null ? o.score : 840,
        vtext: o.verdict || 'FUNDABLE · STRONG',
      };
    },
    update(layer, lt, dur){
      const r = layer._r;
      const p = easeInOut(clamp(lt / (dur * 0.62), 0, 1)) * 0.92;
      r.arc.setAttribute('stroke-dashoffset', GAUGE_LEN * (1 - p));
      r.arc.style.filter = 'drop-shadow(0 0 7px rgba(43,255,136,.85))';
      r.needle.setAttribute('transform', 'rotate(' + (-90 + p * 180) + ' 210 220)');
      r.ticks.forEach((el, k) => el.setAttribute('stroke',
        (k / 20) <= p ? '#2bff88' : 'rgba(255,255,255,.22)'));
      r.num.textContent = Math.round(p / 0.92 * r.target);
      r.verdict.textContent = lt > dur * 0.62 ? r.vtext : 'SCANNING';
    },
  };

  /* ═══ MODULE: stackingSequence ════════════════════════════════════ */
  const stackingSequence = {
    build(layer, o){
      const items = o.items ||
        ['TERM FUNDING', 'REVOLVING CREDIT', 'EQUIPMENT & ASSETS', 'GROWTH / SBA LAYER'];
      const kicker = mk('div', 'fg-kicker', o.title || 'Funding Stack Blueprint');
      const stack = mk('div', 'sc-stack');
      const blocks = items.map((name, i) => {
        const b = mk('div', 'sc-block');
        b.innerHTML = '<span class="sc-block-idx">0' + (i + 1) + '</span>' +
          '<span class="sc-block-name">' + name + '</span>' +
          '<span class="sc-block-bar"><i></i></span>';
        stack.appendChild(b);
        return b;
      });
      const done = mk('div', 'sc-stack-done', 'BLUEPRINT SEQUENCED');
      layer.append(kicker, stack, done);
      layer._r = { blocks, fills: blocks.map(b => b.querySelector('.sc-block-bar i')), done };
    },
    update(layer, lt, dur){
      const r = layer._r, n = r.blocks.length;
      r.blocks.forEach((b, k) => {
        const start = 300 + k * ((dur - 1400) / n);
        const f = easeOut(clamp((lt - start) / 560, 0, 1));
        b.style.opacity = f;
        b.style.transform = 'translateY(' + lerp(6, 0, f) + 'vmin)';
        const flash = clamp(1 - (lt - start) / 560, 0, 1) * clamp((lt - start) / 110, 0, 1);
        b.style.borderColor = 'rgba(43,255,136,' + (.16 + flash * .8) + ')';
        b.style.boxShadow = flash > 0 ? '0 0 ' + (flash * 40) + 'px rgba(43,255,136,.5)' : 'none';
        r.fills[k].style.width = (easeOut(clamp((lt - start - 200) / 600, 0, 1)) * 100) + '%';
      });
      r.done.style.opacity = clamp((lt - (dur - 1000)) / 400, 0, 1);
    },
  };

  /* ═══ MODULE: reportUnlock ════════════════════════════════════════ */
  const reportUnlock = {
    build(layer, o){
      const card = mk('div', 'fg-card sc-report');
      card.innerHTML =
        '<div class="sc-report-head"><span class="sc-lock">⬢</span>' +
        '<span class="sc-report-title">' + (o.title || 'FUNDING PATH REPORT') + '</span></div>' +
        '<div class="sc-rlines">' +
        ['APPROVAL ODDS', 'LENDER MATCHES', 'FUNDABLE AMOUNT', 'NEXT BEST ACTION']
          .map(t => '<div class="sc-rline"><span>' + t + '</span><i></i></div>').join('') +
        '</div><div class="sc-stamp">REPORT UNLOCKED</div>';
      const flood = mk('div', 'sc-report-flood');
      card.appendChild(flood);
      layer.append(card);
      layer._r = {
        card, flood,
        lock: card.querySelector('.sc-lock'),
        lines: [...card.querySelectorAll('.sc-rline')],
        stamp: card.querySelector('.sc-stamp'),
      };
    },
    update(layer, lt, dur){
      const r = layer._r, p = clamp(lt / dur, 0, 1);
      const unlockAt = dur * 0.46;
      if (lt < unlockAt){
        const shake = Math.min(1, lt / unlockAt);
        r.lock.style.transform = 'translateX(' + Math.sin(lt / 46) * shake * 1.4 + 'vmin)';
        r.lock.style.opacity = 1;
        r.lock.style.color = 'var(--fg-ink-soft)';
        r.flood.style.opacity = 0;
        r.lines.forEach(l => { l.style.filter = 'blur(6px)'; l.style.opacity = .3; });
        r.stamp.style.opacity = 0;
      } else {
        const a = (lt - unlockAt) / (dur - unlockAt);
        r.lock.style.opacity = clamp(1 - a * 3, 0, 1);
        r.lock.style.transform = 'translateY(' + (-a * 8) + 'vmin) scale(' + (1 + a) + ')';
        r.flood.style.opacity = clamp(1 - a, 0, 1) * .5;
        r.lines.forEach((l, k) => {
          const f = easeOut(clamp((a - k * .12) / .3, 0, 1));
          l.style.filter = 'blur(' + (1 - f) * 6 + 'px)';
          l.style.opacity = lerp(.3, 1, f);
          const bar = l.querySelector('i');
          bar.style.width = (f * 100) + '%';
        });
        r.stamp.style.opacity = easeOut(clamp((a - .55) / .3, 0, 1));
        r.stamp.style.transform = 'scale(' + lerp(1.3, 1, easeOut(clamp((a - .55) / .3, 0, 1))) + ')';
      }
    },
  };

  /* ═══ MODULE: brokerDashboard ═════════════════════════════════════ */
  const brokerDashboard = {
    build(layer, o){
      const kicker = mk('div', 'fg-kicker', o.title || 'Candidate Pipeline');
      const head = mk('div', 'fg-headline fg-chrome sc-bd-head',
        o.headline || 'Score candidates before you spend time.');
      const data = [
        { n: 'A. MORALES',  b: 'FREIGHT & LOGISTICS', s: 786 },
        { n: 'J. CHEN',     b: 'CHEN FAMILY DENTAL',  s: 642 },
        { n: 'D. OKAFOR',   b: 'OKAFOR BUILD CO.',    s: 819 },
        { n: 'R. PATEL',    b: 'PATEL RETAIL GROUP',  s: 705 },
      ];
      const list = mk('div', 'sc-dash');
      const rows = data.map(d => {
        const row = mk('div', 'sc-row');
        row.innerHTML =
          '<span class="sc-row-dot"></span>' +
          '<span class="sc-row-name">' + d.n + '<em>' + d.b + '</em></span>' +
          '<span class="sc-score">000</span>';
        list.appendChild(row);
        return { row, score: row.querySelector('.sc-score'), dot: row.querySelector('.sc-row-dot'), t: d.s };
      });
      const tally = mk('div', 'sc-bd-tally', '0 QUALIFIED');
      layer.append(kicker, head, list, tally);
      layer._r = { rows, tally };
    },
    update(layer, lt, dur){
      const r = layer._r, n = r.rows.length;
      let qualified = 0;
      r.rows.forEach((row, k) => {
        const start = 500 + k * ((dur - 2400) / n);
        const appear = easeOut(clamp((lt - start) / 460, 0, 1));
        row.row.style.opacity = appear;
        row.row.style.transform = 'translateX(' + lerp(-4, 0, appear) + 'vmin)';
        const count = easeOut(clamp((lt - start - 200) / 900, 0, 1));
        const val = Math.round(count * row.t);
        row.score.textContent = String(val).padStart(3, '0');
        const ok = count >= 1 && row.t >= 700;
        if (count >= 1) {
          row.score.classList.toggle('ok', ok);
          row.score.classList.toggle('mid', !ok);
          row.dot.style.background = ok ? 'var(--fg-green)' : 'var(--fg-chrome-3)';
          row.dot.style.boxShadow = ok ? '0 0 10px var(--fg-green-glow)' : 'none';
          if (ok) qualified++;
        }
      });
      r.tally.textContent = qualified + ' QUALIFIED';
      r.tally.style.opacity = clamp((lt - 1200) / 500, 0, 1);
    },
  };

  /* ═══ MODULE: eventKiosk ══════════════════════════════════════════ */
  const eventKiosk = {
    build(layer, o){
      const kicker = mk('div', 'fg-kicker', o.title || 'Event Edition');
      const kiosk = mk('div', 'sc-kiosk');
      kiosk.innerHTML =
        '<div class="sc-kiosk-screen">' +
        '<div class="sc-kiosk-mark"></div>' +
        '<div class="sc-scan"><span class="sc-scan-line"></span></div>' +
        '<div class="sc-kiosk-cta">SCAN TO START</div></div>';
      const stats = mk('div', 'sc-kiosk-stats');
      stats.innerHTML =
        '<div class="sc-kstat"><span class="sc-kstat-n" data-t="312">0</span><label>BOOTH TRAFFIC</label></div>' +
        '<div class="sc-kstat ok"><span class="sc-kstat-n" data-t="184">0</span><label>QUALIFIED LEADS</label></div>';
      kiosk.querySelector('.sc-kiosk-mark').appendChild(buildWordmark('gauge'));
      layer.append(kicker, kiosk, stats);
      layer._r = {
        scanLine: kiosk.querySelector('.sc-scan-line'),
        cta: kiosk.querySelector('.sc-kiosk-cta'),
        nums: [...stats.querySelectorAll('.sc-kstat-n')],
      };
    },
    update(layer, lt, dur){
      const r = layer._r;
      const sp = ((lt / 1100) % 1 + 1) % 1;
      r.scanLine.style.top = (sp * 100) + '%';
      r.scanLine.style.opacity = Math.sin(sp * Math.PI);
      r.cta.style.opacity = .55 + .45 * Math.sin(lt / 1000 * Math.PI * 2 * 1.1);
      r.nums.forEach(el => {
        const t = +el.dataset.t;
        const f = easeOut(clamp((lt - 900) / (dur - 1600), 0, 1));
        el.textContent = Math.round(f * t);
      });
    },
  };

  /* ═══ MODULE: enterpriseGrid ══════════════════════════════════════ */
  const enterpriseGrid = {
    build(layer, o){
      const kicker = mk('div', 'fg-kicker', o.title || 'Enterprise Platform');
      const hub = mk('div', 'sc-ent-hub', 'FUNDABILITY CORE');
      const grid = mk('div', 'sc-grid');
      const nodes = ['SCORING API', 'WHITE-LABEL WIDGET', 'LIVE DASHBOARD', 'CRM SYNC', 'PARTNER ANALYTICS']
        .map(name => {
          const node = mk('div', 'sc-node');
          node.innerHTML = '<span class="sc-node-dot"></span><span class="sc-node-name">' + name + '</span>';
          grid.appendChild(node);
          return node;
        });
      layer.append(kicker, hub, grid);
      layer._r = { hub, nodes };
    },
    update(layer, lt, dur){
      const r = layer._r, n = r.nodes.length;
      const pulse = .5 + .5 * Math.sin(lt / 700);
      r.hub.style.boxShadow = '0 0 ' + (20 + pulse * 26) + 'px rgba(43,255,136,.5)';
      r.hub.style.opacity = clamp(lt / 500, 0, 1);
      r.nodes.forEach((node, k) => {
        const start = 600 + k * ((dur - 1800) / n);
        const f = easeOut(clamp((lt - start) / 480, 0, 1));
        node.style.opacity = f;
        node.style.transform = 'translateY(' + lerp(4, 0, f) + 'vmin)';
        const live = clamp((lt - start - 300) / 400, 0, 1);
        node.classList.toggle('live', live > .6);
        const dot = node.querySelector('.sc-node-dot');
        dot.style.background = live > .6 ? 'var(--fg-green)' : 'var(--fg-chrome-4)';
        dot.style.boxShadow = live > .6 ? '0 0 12px var(--fg-green-glow)' : 'none';
      });
    },
  };

  /* ═══ MODULE: optimizerCommand — FUNDINGOPTIMI⚡≡R™ command layer ══ */
  const optimizerCommand = {
    build(layer, o){
      const kicker = mk('div', 'fg-kicker', o.title || 'Optimization Command Layer');
      const stage = mk('div', 'sc-opt-stage');
      stage.innerHTML =
        '<div class="sc-opt-core"><span class="sc-opt-ring r1"></span>' +
        '<span class="sc-opt-ring r2"></span><span class="sc-opt-bolt"></span></div>' +
        ['STACK STRATEGY', 'ADVISORY ENGINE', 'OPTIMIZATION PATH']
          .map((t, i) => '<div class="sc-opt-node n' + i + '"><b>' + t + '</b><i></i></div>').join('');
      stage.querySelector('.sc-opt-bolt').innerHTML = BOLT_SVG;
      const panels = mk('div', 'sc-opt-panels');
      panels.innerHTML = [
        ['CAPITAL EFFICIENCY', '+38%'],
        ['STACK SEQUENCE', 'OPTIMAL'],
        ['ADVISORY CONFIDENCE', '96%'],
      ].map(p => '<div class="fg-card sc-opt-panel"><label>' + p[0] +
        '</label><strong>' + p[1] + '</strong></div>').join('');
      layer.append(kicker, stage, panels);
      layer._r = {
        rings: [...stage.querySelectorAll('.sc-opt-ring')],
        nodes: [...stage.querySelectorAll('.sc-opt-node')],
        bolt: stage.querySelector('.sc-opt-bolt'),
        panels: [...panels.querySelectorAll('.sc-opt-panel')],
      };
    },
    update(layer, lt, dur){
      const r = layer._r;
      r.rings[0].style.transform = 'rotate(' + (lt / 28) + 'deg)';
      r.rings[1].style.transform = 'rotate(' + (-lt / 44) + 'deg)';
      const pulse = .5 + .5 * Math.sin(lt / 600);
      r.bolt.style.filter = 'drop-shadow(0 0 ' + (8 + pulse * 14) + 'px rgba(43,255,136,.8))';
      const radius = 31;
      r.nodes.forEach((node, k) => {
        const ang = (lt / 3400) * Math.PI * 2 + (k / 3) * Math.PI * 2;
        const f = easeOut(clamp((lt - 400 - k * 260) / 600, 0, 1));
        node.style.opacity = f;
        node.style.left = (50 + Math.cos(ang) * radius) + '%';
        node.style.top  = (50 + Math.sin(ang) * radius * 1.02) + '%';
        node.querySelector('i').style.width =
          (easeOut(clamp((lt - 800 - k * 260) / 900, 0, 1)) * 100) + '%';
      });
      r.panels.forEach((p, k) => {
        const f = easeOut(clamp((lt - (dur * 0.42) - k * 320) / 620, 0, 1));
        p.style.opacity = f;
        p.style.transform = 'translateY(' + lerp(4, 0, f) + 'vmin)';
      });
    },
  };

  /* ═══ MODULE: endCard ═════════════════════════════════════════════ */
  const endCard = {
    build(layer, o){
      const w = buildWordmark(o.brand || 'gauge');
      w.classList.add('sc-end-mark');
      const div = mk('div', 'sc-end-div');
      const cta = mk('div', 'sc-end-cta', o.cta || 'Check your fundability.');
      const url = mk('div', 'sc-end-url', o.url || 'fundinggauge.com');
      layer.append(w, div, cta, url);
      layer._r = { w, div, cta, url };
    },
    update(layer, lt){
      const r = layer._r;
      const a = easeOut(clamp(lt / 700, 0, 1));
      r.w.style.opacity = a;
      r.w.style.transform = 'scale(' + lerp(1.05, 1, a) + ')';
      r.div.style.width = (easeOut(clamp((lt - 500) / 600, 0, 1)) * 32) + 'vmin';
      r.cta.style.opacity = clamp((lt - 700) / 420, 0, 1);
      r.url.style.opacity = clamp((lt - 950) / 420, 0, 1);
    },
  };

  /* ═══ INSERTS — abstract brand-graded thought-flashes ═════════════
     Teacher/numbers/confused-person concepts, abstracted into the
     brand world: dark, green/chrome, HUD overlay, glitch. Short. ══ */
  const inserts = {
    build(layer, kind){
      layer.classList.add('sc-insert', 'sc-insert-' + kind);
      if (kind === 'numbers'){
        let g = '';
        for (let i = 0; i < 132; i++)
          g += '<span style="--d:' + hash(i).toFixed(3) + '">' +
               Math.floor(hash(i * 7.3) * 10) + '</span>';
        layer.innerHTML = '<div class="sc-ins-grid">' + g + '</div>';
      } else if (kind === 'doubt'){
        layer.innerHTML =
          '<div class="sc-ins-fig"></div>' +
          '<div class="sc-ins-q">?</div>' +
          '<div class="sc-ins-marks">$ % ? $ ? %</div>';
      } else { /* chalk */
        layer.innerHTML =
          '<div class="sc-ins-board"><div class="sc-ins-scrawl">7&nbsp;&nbsp;3&nbsp;&nbsp;?<br>×&nbsp;&nbsp;%&nbsp;&nbsp;$<br>↗ ↗ ↗</div></div>';
      }
      layer.innerHTML += '<div class="sc-ins-scan"></div>';
    },
    update(layer, lt, dur){
      const a = lt / dur;
      const jitter = (hash(Math.floor(lt / 28)) - .5) * 2.2;
      const slice = hash(Math.floor(lt / 34) + 3) * 30;
      layer.style.transform = 'translateX(' + jitter + 'vmin)';
      layer.style.clipPath =
        'polygon(0 ' + slice + '%,100% ' + (slice - 6) + '%,100% 100%,0 100%)';
      layer.style.opacity = Math.sin(clamp(a, 0, 1) * Math.PI);
      const grid = layer.querySelector('.sc-ins-grid');
      if (grid) grid.style.opacity = .4 + .6 * hash(Math.floor(lt / 30));
    },
  };

  /* ── export ───────────────────────────────────────────────────── */
  global.FG = {
    buildWordmark,
    helpers: { clamp, lerp, easeOut, easeInOut, env, hash, mk },
    modules: {
      logoBoot, ignition, scoreGauge, stackingSequence, reportUnlock,
      brokerDashboard, eventKiosk, enterpriseGrid, optimizerCommand, endCard,
    },
    inserts,
  };
})(window);
