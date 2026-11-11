/**
 * @id ppgSpectraNoiseFinder
 * @title PPG Raw Detector Spectra (Noise Source Finder)
 * @category Signal Quality & Diagnostics
 * @order 2
 */
// Power spectrum of each RAW optical detector channel (64 Hz sampling -> 0-32 Hz shown)
// to help track down where optical noise is coming from.
//
// How to read it:
//   * Green band  = cardiac passband (0.7-3 Hz). Real pulse should be a peak here on IR/Red.
//   * Orange line = a peak that also shows up on the AMBIENT channel (light, not blood) -> room lighting / LED flicker.
//   * Red dashed  = where mains-powered lights alias after 64 Hz sampling:
//         60 Hz mains -> 4, 8, 12 Hz      50 Hz mains -> 14, 28 Hz  (and 50/60 harmonics)
//     A peak sitting on one of these lines (strongest on Ambient) = fluorescent / LED room light.
//   * Peak at breathing (0.1-0.4 Hz) or broad < 1 Hz hump = respiration / motion / slow drift.
//   * Broad rising floor toward 32 Hz on all channels = detector / ADC noise.
// Keys: [S] cycle source (raw / short 8mm / long 20mm)   [L] log vs linear   [P] pause

const FS = 64;
const MAX_HZ = 32;
const CHANNELS = [
  { key: 'ambient',  label: 'Ambient (dark current / room light)', hue: 40 },
  { key: 'infrared', label: 'Infrared 850 nm',                      hue: 0 },
  { key: 'red',      label: 'Red 660 nm',                           hue: 350 },
  { key: 'optics4',  label: 'Optics 4 / NIR 730 nm',                hue: 200 }
];
const SHORT_LONG = [
  { key: 'ambient', label: 'Ambient', hue: 40 },
  { key: 'ir850',   label: 'IR 850 nm', hue: 0 },
  { key: 'red660',  label: 'Red 660 nm', hue: 350 },
  { key: 'nir730',  label: 'NIR 730 nm', hue: 200 }
];
const ALIASES = [
  { f: 4, txt: '60Hz→4' }, { f: 8, txt: '120→8' }, { f: 12, txt: '180→12' },
  { f: 14, txt: '50Hz→14' }, { f: 28, txt: '100→28' }
];

let source = 0;            // 0 raw, 1 short, 2 long
let logScale = true;
let paused = false;
let psd = [[], [], [], []]; // smoothed power per channel (one value per 1/(N/FS) Hz bin)
let freqRes = 0.125;
let frameTick = 0;

function setup() {
  colorMode(HSB, 360, 100, 100, 1);
  textFont('monospace');
}

function keyPressed() {
  if (key === 's' || key === 'S') { source = (source + 1) % 3; psd = [[], [], [], []]; }
  if (key === 'l' || key === 'L') logScale = !logScale;
  if (key === 'p' || key === 'P') paused = !paused;
}

function getSamples(ch) {
  if (source === 0) return eegData.getPPGChannel(ch.key, 512) || [];
  if (source === 1) return eegData.getShortPPGChannel(ch.key, 512) || [];
  return eegData.getLongPPGChannel(ch.key, 512) || [];
}

// Hann-windowed, mean+linear-trend removed DFT power for bins 0..MAX_HZ
function spectrum(x) {
  const N = x.length;
  if (N < 64) return null;
  let sx = 0, sxx = 0, sy = 0, sxy = 0;
  for (let i = 0; i < N; i++) { sx += i; sxx += i * i; sy += x[i]; sxy += i * x[i]; }
  const slope = (N * sxy - sx * sy) / (N * sxx - sx * sx || 1);
  const icpt = (sy - slope * sx) / N;
  const d = new Array(N);
  let wsum = 0;
  for (let i = 0; i < N; i++) {
    const w = 0.5 * (1 - Math.cos(2 * Math.PI * i / (N - 1)));
    d[i] = (x[i] - (icpt + slope * i)) * w;
    wsum += w * w;
  }
  freqRes = FS / N;
  const bins = Math.floor(MAX_HZ / freqRes);
  const out = new Array(bins + 1);
  for (let k = 0; k <= bins; k++) {
    let re = 0, im = 0;
    const wk = 2 * Math.PI * k / N;
    for (let n = 0; n < N; n++) { re += d[n] * Math.cos(wk * n); im -= d[n] * Math.sin(wk * n); }
    out[k] = (re * re + im * im) / (wsum * FS);
  }
  return out;
}

function updateSpectra() {
  const list = source === 0 ? CHANNELS : SHORT_LONG;
  for (let c = 0; c < 4; c++) {
    const s = spectrum(getSamples(list[c]));
    if (!s) { psd[c] = []; continue; }
    if (psd[c].length !== s.length) psd[c] = s.slice();
    else for (let k = 0; k < s.length; k++) psd[c][k] = 0.7 * psd[c][k] + 0.3 * s[k];
  }
}

function draw() {
  background(225, 35, 8);
  if (!paused && frameTick++ % 6 === 0) updateSpectra();

  const list = source === 0 ? CHANNELS : SHORT_LONG;
  const srcName = ['RAW detectors (eegData.ppgHistory)', 'SHORT 8 mm (Athena)', 'LONG 20 mm (Athena)'][source];
  const L = 70, R = width - 20, top = 54, bottom = height - 34;
  const ph = (bottom - top) / 4;

  noStroke(); fill(0, 0, 90);
  textAlign(LEFT, TOP); textSize(14);
  text('PPG spectra – ' + srcName + (paused ? '  [paused]' : ''), L, 12);
  textSize(10); fill(0, 0, 60);
  text('[S] source  [L] ' + (logScale ? 'log (dB)' : 'linear') + '  [P] pause   df = ' + freqRes.toFixed(3) + ' Hz', L, 32);

  const xOf = f => map(f, 0, MAX_HZ, L, R);

  // Ambient reference for "also on ambient?" check
  const amb = psd[0];

  for (let c = 0; c < 4; c++) {
    const y0 = top + c * ph, y1 = y0 + ph - 8;
    const p = psd[c];
    fill(0, 0, 12); noStroke(); rect(L, y0, R - L, y1 - y0);
    // cardiac band
    fill(130, 60, 70, 0.18); rect(xOf(0.7), y0, xOf(3) - xOf(0.7), y1 - y0);
    // alias markers
    stroke(0, 70, 90, 0.5); strokeWeight(1);
    for (const a of ALIASES) {
      for (let yy = y0; yy < y1; yy += 7) line(xOf(a.f), yy, xOf(a.f), Math.min(yy + 3, y1));
    }
    noStroke(); fill(0, 0, 75); textSize(11); textAlign(RIGHT, TOP);
    text(list[c].label, R - 6, y0 + 3);

    if (!p || p.length < 3) {
      fill(0, 0, 50); textSize(11); text('waiting for optical data (connect Athena or press Simulate)…', L + 6, y0 + 20);
      continue;
    }

    // scale
    let maxP = 1e-12;
    for (let k = 1; k < p.length; k++) maxP = Math.max(maxP, p[k]);
    const dbOf = v => 10 * Math.log10(Math.max(v, 1e-12));
    const dbMax = dbOf(maxP), dbMin = dbMax - 60;
    const yOfP = v => logScale
      ? map(constrain(dbOf(v), dbMin, dbMax), dbMin, dbMax, y1, y0 + 24)
      : map(v, 0, maxP, y1, y0 + 24);

    noFill(); stroke(list[c].hue, 80, 95); strokeWeight(1.6);
    beginShape();
    for (let k = 1; k < p.length; k++) vertex(xOf(k * freqRes), yOfP(p[k]));
    endShape();

    // top peaks above 0.3 Hz (local maxima), label if also present on ambient
    const peaks = [];
    for (let k = Math.ceil(0.3 / freqRes) + 1; k < p.length - 1; k++) {
      if (p[k] > p[k - 1] && p[k] > p[k + 1]) peaks.push(k);
    }
    peaks.sort((a, b) => p[b] - p[a]);
    noStroke(); textSize(10); textAlign(CENTER, BOTTOM);
    for (const k of peaks.slice(0, 3)) {
      const f = k * freqRes;
      const onAmb = c !== 0 && f > 3.5 && amb && amb.length === p.length && amb[k] > 0 &&
        dbOf(amb[k]) > dbOf(Math.max.apply(null, amb.slice(1))) - 15;
      fill(onAmb ? color(30, 90, 100) : color(0, 0, 90));
      const x = xOf(f), y = yOfP(p[k]);
      ellipse(x, y, 5, 5);
      text(f.toFixed(2) + ' Hz' + (onAmb ? ' ⚠amb' : ''), x, y - 3);
    }
  }

  // x axis
  stroke(0, 0, 40); strokeWeight(1); line(L, bottom, R, bottom);
  noStroke(); fill(0, 0, 60); textSize(10); textAlign(CENTER, TOP);
  for (let f = 0; f <= MAX_HZ; f += 4) text(f, xOf(f), bottom + 4);
  textAlign(RIGHT, TOP); text('Hz', R, bottom + 16);
  textAlign(LEFT, TOP); fill(130, 50, 80); text('■ cardiac 0.7–3 Hz', L, bottom + 16);
  fill(0, 70, 90); text('┆ mains-light aliases', L + 140, bottom + 16);
}
