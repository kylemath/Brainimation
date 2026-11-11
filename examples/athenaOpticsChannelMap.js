/**
 * @id athenaOpticsChannelMap
 * @title Athena Raw Optics Channel Map (what is each channel?)
 * @category Signal Quality & Diagnostics
 * @order 1
 */
// Shows EVERY raw optical channel from the Muse S Athena packet (up to 16 @ 64 Hz) with no
// wavelength/distance labels applied, so you can work out what each index really is.
//
// Put the headband ON your forehead and sit still for ~10 s, then read each row:
//   DC        mean raw counts. Short-distance detectors are far brighter than long ones; a dark/ambient
//             channel is near zero. Rows with the same DC are probably the same emitter/detector pair.
//   PI %      pulsatile amplitude / DC in the 0.7-3 Hz cardiac band. Red and IR differ here; ambient ~0.
//   SNR dB    cardiac peak vs median noise floor (3.5-12 Hz). Higher = cleaner heartbeat.
//   HR        frequency of the cardiac peak (should match across channels that see the pulse).
//   twin      other channel most correlated with this one (r). r ~ 1.0 = same signal measured twice
//             (e.g. two detectors of one LED); different wavelength / distance pairs correlate less.
//   trace     last ~4 s of the cardiac-band signal, auto-scaled.
// Try: cover the sensor with your hand (all go dark), then shine a phone torch at it (which channels
// react = which ones really measure ambient light).  [P] pause

const FS = 64, N = 256;
let rows = [];
let tick = 0, paused = false;

function setup() { colorMode(HSB, 360, 100, 100, 1); textFont('monospace'); }
function keyPressed() { if (key === 'p' || key === 'P') paused = !paused; }

// cardiac-ish band-pass: subtract ~1.5 s moving average, then 3-point smooth
function bandpass(x) {
  const n = x.length, out = new Array(n), W = 96;
  let acc = 0;
  const cs = new Array(n + 1); cs[0] = 0;
  for (let i = 0; i < n; i++) cs[i + 1] = cs[i] + x[i];
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - W / 2), b = Math.min(n, i + W / 2);
    out[i] = x[i] - (cs[b] - cs[a]) / (b - a);
  }
  const sm = new Array(n);
  for (let i = 0; i < n; i++) sm[i] = (out[Math.max(0, i - 1)] + out[i] + out[Math.min(n - 1, i + 1)]) / 3;
  return sm;
}

function powerSpectrum(x) {
  const n = x.length, bins = Math.floor(32 * n / FS), P = new Array(bins + 1);
  let mean = 0; for (const v of x) mean += v; mean /= n;
  const d = x.map((v, i) => (v - mean) * 0.5 * (1 - Math.cos(2 * Math.PI * i / (n - 1))));
  for (let k = 0; k <= bins; k++) {
    let re = 0, im = 0; const w = 2 * Math.PI * k / n;
    for (let i = 0; i < n; i++) { re += d[i] * Math.cos(w * i); im -= d[i] * Math.sin(w * i); }
    P[k] = re * re + im * im;
  }
  return P;
}

function corr(a, b) {
  const n = Math.min(a.length, b.length);
  let sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
  for (let i = 0; i < n; i++) { sa += a[i]; sb += b[i]; saa += a[i] * a[i]; sbb += b[i] * b[i]; sab += a[i] * b[i]; }
  const den = Math.sqrt((saa - sa * sa / n) * (sbb - sb * sb / n));
  return den > 1e-9 ? (sab - sa * sb / n) / den : 0;
}

function analyse() {
  const cnt = eegData.optics.count;
  const raw = [], bp = [];
  rows = [];
  for (let c = 0; c < cnt; c++) {
    const x = eegData.getOpticsChannel(c, N);
    raw.push(x);
    bp.push(x.length >= 128 ? bandpass(x) : []);
  }
  for (let c = 0; c < cnt; c++) {
    const x = raw[c], r = { idx: c, ok: x.length >= 128 };
    if (!r.ok) { rows.push(r); continue; }
    let dc = 0; for (const v of x) dc += v; dc /= x.length;
    const y = bp[c];
    let mn = Infinity, mx = -Infinity;
    for (const v of y) { if (v < mn) mn = v; if (v > mx) mx = v; }
    r.dc = dc;
    r.pi = Math.abs(dc) > 1 ? 100 * (mx - mn) / Math.abs(dc) : 0;
    const P = powerSpectrum(x), df = FS / x.length;
    let pk = 0, pkK = 0;
    for (let k = Math.ceil(0.7 / df); k <= Math.floor(3 / df); k++) if (P[k] > pk) { pk = P[k]; pkK = k; }
    const floor = P.slice(Math.ceil(3.5 / df), Math.floor(12 / df)).sort((a, b) => a - b);
    const med = floor.length ? floor[Math.floor(floor.length / 2)] : 1e-9;
    r.snr = 10 * Math.log10((pk + 1e-9) / (med + 1e-9));
    r.hr = pkK * df;
    r.trace = y.slice(-256);
    let best = -1, bestR = 0;
    for (let o = 0; o < cnt; o++) {
      if (o === c || bp[o].length < 128) continue;
      const rr = corr(y, bp[o]);
      if (Math.abs(rr) > Math.abs(bestR)) { bestR = rr; best = o; }
    }
    r.twin = best; r.twinR = bestR;
    rows.push(r);
  }
}

function draw() {
  background(225, 35, 8);
  if (!paused && tick++ % 15 === 0) analyse();

  noStroke(); fill(0, 0, 90); textAlign(LEFT, TOP); textSize(14);
  text('Athena raw optics channel map' + (paused ? '  [paused]' : ''), 16, 10);
  textSize(10); fill(0, 0, 60);
  if (!eegData.optics || eegData.optics.count === 0) {
    text('No raw optics yet - connect an Athena with PPG: ON (the simulator has no raw optical packet).', 16, 34);
    return;
  }
  text(eegData.optics.count + ' optical channels in packet. Sit still on-head, then try covering the sensor / shining a torch.', 16, 30);

  const top = 70, rowH = Math.min(34, (height - top - 10) / Math.max(1, rows.length));
  const cols = [16, 56, 170, 250, 330, 400, 520];
  fill(0, 0, 55); textSize(10);
  ['ch', 'DC (counts)', 'PI %', 'SNR dB', 'HR Hz', 'twin (r)', 'cardiac-band trace'].forEach((h, i) => text(h, cols[i], top - 14));

  const maxLogDc = Math.max.apply(null, rows.filter(r => r.ok).map(r => Math.log10(Math.abs(r.dc) + 1))) || 1;
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i], y = top + i * rowH;
    fill(0, 0, i % 2 ? 11 : 14); rect(8, y, width - 16, rowH - 2);
    fill(0, 0, 90); textSize(12); textAlign(LEFT, CENTER);
    text(r.idx, cols[0], y + rowH / 2);
    if (!r.ok) { fill(0, 0, 45); textSize(10); text('collecting...', cols[1], y + rowH / 2); continue; }
    // DC bar + number
    fill(200, 50, 60); rect(cols[1], y + rowH * 0.3, 70 * Math.log10(Math.abs(r.dc) + 1) / maxLogDc, rowH * 0.35);
    fill(0, 0, 85); textSize(10); text(Math.round(r.dc), cols[1] + 74, y + rowH / 2);
    fill(r.pi > 0.1 ? color(120, 60, 90) : color(0, 0, 50)); text(r.pi.toFixed(2), cols[2], y + rowH / 2);
    fill(r.snr > 10 ? color(120, 60, 90) : r.snr > 4 ? color(45, 80, 95) : color(0, 70, 85));
    text(r.snr.toFixed(1), cols[3], y + rowH / 2);
    fill(0, 0, 75); text(r.hr.toFixed(2) + ' (' + Math.round(r.hr * 60) + ')', cols[4], y + rowH / 2);
    fill(0, 0, 75); text(r.twin >= 0 ? 'ch' + r.twin + ' (' + r.twinR.toFixed(2) + ')' : '-', cols[5], y + rowH / 2);
    // sparkline
    const t = r.trace; let m = 1e-9; for (const v of t) m = Math.max(m, Math.abs(v));
    const x0 = cols[6], x1 = width - 20;
    stroke(190, 60, 95); strokeWeight(1); noFill();
    beginShape();
    for (let k = 0; k < t.length; k++) vertex(map(k, 0, t.length - 1, x0, x1), y + rowH / 2 - (t[k] / m) * (rowH * 0.4));
    endShape();
    noStroke();
  }
}
