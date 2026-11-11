/**
 * @id athenaPresetSweep
 * @title Athena Preset Sweep (auto-compare optics presets)
 * @category Signal Quality & Diagnostics
 * @order 0
 */
// Cycles a connected Muse S Athena through its optics presets, records each one while you sit
// still on-head, and ranks them in one table - so you don't have to eyeball traces.
//
//   [G]  start / stop the sweep (~15 s per preset)      [C]  clear results
//   [A]  toggle "all presets" / "16-channel + 8-channel only"
//
// Per preset it reports (using each raw optical channel in the packet, no labels applied):
//   good    channels with a clean heartbeat (SNR > 20 dB and pulse amplitude > 0.1 % of DC)
//   clip    channels that are large but dead flat (pulse < 0.05 % of DC) -> saturated / clipped
//   dark    channels with ~zero DC (LED off or blocked)    noisy = everything else
//   SNR     median heartbeat SNR of the good channels      DC  their median raw level
//   strip   one letter per channel in packet order: G good  c clipped  d dark  n noisy
// Keep the headband on and stay still for the whole sweep. Packets restart at each preset change.

const FS = 64;
const ALL = ['p1041', 'p1042', 'p1043', 'p1044', 'p1034', 'p1035', 'p1045', 'p1046', 'p4129'];
const BIG = ['p1041', 'p1042', 'p1043', 'p1044', 'p1034'];
const SETTLE_MS = 5000, RECORD_MS = 10000;

let list = ALL;
let running = false, idx = -1, phase = 'idle', phaseT = 0, status = 'press G to start';
let results = [];
let baseline = null;

function setup() { colorMode(HSB, 360, 100, 100, 1); textFont('monospace'); }

function keyPressed() {
  if (key === 'g' || key === 'G') running ? stopSweep('stopped') : startSweep();
  if (key === 'c' || key === 'C') { results = []; }
  if (key === 'a' || key === 'A') { if (!running) list = list === ALL ? BIG : ALL; }
}

function startSweep() {
  if (!eegData.connected) { status = 'Connect an Athena first (Connect Muse), then press G.'; return; }
  baseline = eegData.getAthenaPreset();
  results = []; idx = -1; running = true;
  nextPreset();
}

function stopSweep(msg) {
  running = false; phase = 'idle'; status = msg;
}

function nextPreset() {
  idx++;
  if (idx >= list.length) {
    // return to where we started
    status = 'done - restoring ' + (baseline || 'auto') + '...';
    running = false; phase = 'idle';
    eegData.setAthenaPreset(baseline || '').then(() => { status = 'done (restored ' + (baseline || 'auto') + ')'; });
    return;
  }
  phase = 'switching'; status = 'switching to ' + list[idx] + '...';
  eegData.setAthenaPreset(list[idx]).then(() => {
    if (!running) return;
    phase = 'settling'; phaseT = millis(); status = list[idx] + ': settling';
  }).catch(e => { stopSweep('switch failed: ' + e); });
}

// ---- analysis helpers ----
function bandpassed(x) {
  const n = x.length, W = 96, cs = [0];
  for (let i = 0; i < n; i++) cs.push(cs[i] + x[i]);
  const hp = x.map((v, i) => { const a = Math.max(0, i - W / 2), b = Math.min(n, i + W / 2); return v - (cs[b] - cs[a]) / (b - a); });
  return hp.map((v, i) => (hp[Math.max(0, i - 1)] + v + hp[Math.min(n - 1, i + 1)]) / 3);
}

function powerSpectrum(x) {
  const n = x.length, bins = Math.floor(32 * n / FS), P = [];
  let m = 0; for (const v of x) m += v; m /= n;
  const d = x.map((v, i) => (v - m) * 0.5 * (1 - Math.cos(2 * Math.PI * i / (n - 1))));
  for (let k = 0; k <= bins; k++) {
    let re = 0, im = 0; const w = 2 * Math.PI * k / n;
    for (let i = 0; i < n; i++) { re += d[i] * Math.cos(w * i); im -= d[i] * Math.sin(w * i); }
    P.push(re * re + im * im);
  }
  return P;
}

function median(a) { if (!a.length) return 0; const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; }

function analysePreset(name) {
  const cnt = eegData.optics.count;
  const chans = [];
  for (let c = 0; c < cnt; c++) {
    const x = eegData.getOpticsChannel(c, 512);
    if (x.length < 256) { chans.push({ cls: 'n', dc: 0, pi: 0, snr: 0 }); continue; }
    let dc = 0; for (const v of x) dc += v; dc /= x.length;
    const y = bandpassed(x);
    let mn = Infinity, mx = -Infinity; for (const v of y) { if (v < mn) mn = v; if (v > mx) mx = v; }
    const pi = Math.abs(dc) > 1 ? 100 * (mx - mn) / Math.abs(dc) : 0;
    const P = powerSpectrum(x), df = FS / x.length;
    let pk = 0; for (let k = Math.ceil(0.7 / df); k <= Math.floor(3 / df); k++) pk = Math.max(pk, P[k]);
    const fl = P.slice(Math.ceil(3.5 / df), Math.floor(12 / df)).sort((a, b) => a - b);
    const snr = 10 * Math.log10((pk + 1e-9) / ((fl[Math.floor(fl.length / 2)] || 1e-9) + 1e-9));
    let cls = 'n';
    if (Math.abs(dc) < 2000) cls = 'd';
    else if (pi < 0.05 && Math.abs(dc) > 1e5) cls = 'c';
    else if (snr > 20 && pi > 0.1) cls = 'G';
    chans.push({ cls, dc, pi, snr });
  }
  const good = chans.filter(c => c.cls === 'G');
  results.push({
    name, n: cnt,
    good: good.length, clip: chans.filter(c => c.cls === 'c').length, dark: chans.filter(c => c.cls === 'd').length,
    snr: median(good.map(c => c.snr)), dc: median(good.map(c => c.dc)), pi: median(good.map(c => c.pi)),
    strip: chans.map(c => c.cls).join('')
  });
}

function draw() {
  background(225, 35, 8);
  noStroke(); fill(0, 0, 90); textAlign(LEFT, TOP); textSize(14);
  text('Athena optics preset sweep', 16, 10);
  textSize(11); fill(0, 0, 65);
  text('[G] ' + (running ? 'stop' : 'start') + '   [C] clear   [A] presets: ' + list.join(' '), 16, 32);

  // state machine
  if (running && phase === 'settling' && millis() - phaseT > SETTLE_MS) {
    phase = 'recording'; phaseT = millis(); status = list[idx] + ': recording - keep still';
  } else if (running && phase === 'recording') {
    const left = Math.ceil((RECORD_MS - (millis() - phaseT)) / 1000);
    status = list[idx] + ': recording - keep still (' + Math.max(left, 0) + ' s)';
    if (millis() - phaseT > RECORD_MS) { analysePreset(list[idx]); nextPreset(); }
  }

  fill(running ? color(45, 90, 100) : color(0, 0, 80)); textSize(12);
  text(status + (running ? '   [' + (idx + 1) + '/' + list.length + ']' : ''), 16, 54);

  const cols = [16, 100, 150, 215, 270, 330, 400, 480, 640];
  fill(0, 0, 55); textSize(10);
  ['preset', 'ch', 'good', 'clip', 'dark', 'SNR dB', 'PI %', 'DC', 'channel strip (G good, c clipped, d dark, n noisy)'].forEach((h, i) => text(h, cols[i], 82));

  const ranked = results.slice().sort((a, b) => b.good - a.good || b.snr - a.snr);
  const bestName = ranked.length ? ranked[0].name : null;
  const rowH = 26;
  results.forEach((r, i) => {
    const y = 100 + i * rowH;
    fill(0, 0, i % 2 ? 11 : 14); rect(8, y, width - 16, rowH - 2);
    textAlign(LEFT, CENTER); textSize(12);
    fill(r.name === bestName ? color(120, 60, 95) : color(0, 0, 90)); text(r.name + (r.name === bestName ? ' ★' : ''), cols[0], y + rowH / 2);
    fill(0, 0, 80); text(r.n, cols[1], y + rowH / 2);
    fill(r.good ? color(120, 60, 90) : color(0, 70, 85)); text(r.good, cols[2], y + rowH / 2);
    fill(r.clip ? color(30, 90, 100) : color(0, 0, 55)); text(r.clip, cols[3], y + rowH / 2);
    fill(0, 0, 60); text(r.dark, cols[4], y + rowH / 2);
    fill(0, 0, 85); text(r.snr.toFixed(1), cols[5], y + rowH / 2);
    text(r.pi.toFixed(2), cols[6], y + rowH / 2);
    text(Math.round(r.dc), cols[7], y + rowH / 2);
    textSize(13);
    for (let k = 0; k < r.strip.length; k++) {
      const ch = r.strip[k];
      fill(ch === 'G' ? color(120, 60, 95) : ch === 'c' ? color(30, 90, 100) : ch === 'd' ? color(0, 0, 45) : color(0, 70, 85));
      text(ch, cols[8] + k * 11 + (k >= 4 ? 5 : 0) + (k >= 8 ? 5 : 0) + (k >= 12 ? 5 : 0), y + rowH / 2);
    }
    textAlign(LEFT, TOP);
  });

  if (results.length) {
    fill(0, 0, 60); textSize(10);
    text('★ = most good channels, then best median SNR. Strip groups of 4 follow packet index order (16-ch: 0-3, 4-7, 8-11, 12-15).', 16, 100 + results.length * rowH + 8);
  }
}
