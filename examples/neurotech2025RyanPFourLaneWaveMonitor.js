/**
 * @id neurotech2025RyanPFourLaneWaveMonitor
 * @title 4-Lane Wave Monitor & Target Trainer (Ryan Park)
 * @category 2025 Neurotech Class Catalogue
 * @order 79
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Four-lane real-time EEG wave monitor for Alpha, Beta, Theta, and Delta with interactive target-band selection.
 */
// 🧠 BrainImation Starter Template 
// Access real-time brain data and create live visualizations! 
// Built-up Wave Visualization trainer that keeps the starter structure, 
// adds four non-overlapping lanes, smoothing, auto-scaling, and a target bar. 
// ------------- config ------------- 
const LANE_NAMES = [ "alpha" , "beta" , "theta" , "delta" ]; 
const LANE_HUES = [ 140 , 15 , 260 , 200 ]; // HSB hues per lane 
const SMOOTH = 0.85 ; // exponential smoothing 
const HISTORY = 900 ; // on-screen samples 
const AUTO_SECS = 6 ; // window for auto scale 
const HOLD_SECS = 3 ; // time above threshold to score 
// ------------- state ------------- 
let smooth = { alpha: 0 , beta: 0 , theta: 0 , delta: 0 , attention: 0 , meditation: 0 }; 
let hist = []; // {a,b,t,d,att,med} 
let ring = []; // circular buffer for auto scale 
let ringIdx = 0 ; 
let paused = false ; 
let showGrid = true ; 
// target trainer


let target = { band: "alpha" , threshold: 0.60 , held: 0 , hits: 0 , enabled: true }; 
// ------------- setup ------------- 
function setup() { 
// Canvas already created, set preferences 
colorMode( HSB , 360 , 100 , 100 , 1 ); // HSB color mode is great for brain art 
textFont( "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans" ); 
ring = new Array ( 600 ).fill({a: 0 ,b: 0 ,t: 0 ,d: 0 ,att: 0 ,med: 0 }); // about 10 s at 60 fps 
} 
// ------------- draw ------------- 
function draw() { 
// Access brain data, these values update in real time 
// Keep the starter variables, then use the smoothed versions below 
const e = typeof eegData !== "undefined" ? eegData : simEEG(); 
let alpha = e.alpha; // 0.0..1.0 high when relaxed or meditating 
let beta = e.beta; // 0.0..1.0 high when focused or attentive 
let theta = e.theta; // 0.0..1.0 high during deep meditation 
let attention = e.attention ?? 0.5 ; // derived metric 
// Background that responds to meditation state, keep starter idea but make it richer 
let bgAlpha = map(e.meditation ?? 0.5 , 0 , 1 , 0.06 , 0.18 ); 
background( map(theta, 0 , 1 , 195 , 300 ), 24 + (e.meditation ?? 0.5 )* 30 , 12 , bgAlpha );

// Example shape from the starter, now a subtle center pulse tied to attention 
let size = 40 + attention * 120 ; 
noStroke(); 
fill( 180 , 70 , 90 , 0.15 ); 
ellipse(width/ 2 , height/ 2 , size); 
// Build the trainer on top of the starter 
if (!paused) { 
// exponential smoothing for stable visuals 
smooth.alpha = lerp(alpha, smooth.alpha, SMOOTH ); 
smooth.beta = lerp(beta, smooth.beta, SMOOTH ); 
smooth.theta = lerp(theta, smooth.theta, SMOOTH ); 
smooth.delta = lerp(e.delta, smooth.delta, SMOOTH ); 
smooth.attention = lerp(attention, smooth.attention, SMOOTH ); 
smooth.meditation = lerp(e.meditation ?? 0.5 , smooth.meditation, SMOOTH ); 
// push to scrolling history 
hist.push({ 
a:smooth.alpha, b:smooth.beta, t:smooth.theta, d:smooth.delta, 
att:smooth.attention, med:smooth.meditation 
}); 
if (hist.length > HISTORY ) hist.shift();

// update auto scale ring buffer 
ring[ringIdx] = hist[hist.length - 1 ]; 
ringIdx = (ringIdx + 1 ) % ring.length; 
// target hold logic 
if (target.enabled) updateTargetHold(); 
} 
// draw grid and four clean lanes that never overlap 
if (showGrid) drawGrid(); 
drawWaves(); 
drawTargetBar(); 
drawHUD(); 
} 
// ------------- drawing helpers ------------- 
function drawGrid() { 
stroke( 0 , 0 , 70 , 0.25 ); 
strokeWeight( 1 ); 
const lanes = 4 ; 
for ( let i = 0 ; i <= lanes; i++) { 
const y = map(i, 0 , lanes, 0 , height); 
line( 0 , y, width, y);

} 
// vertical ticks 
const cols = 12 ; 
for ( let i = 1 ; i < cols; i++) { 
const x = i * width / cols; 
line(x, 0 , x, height); 
} 
} 
function drawWaves() { 
if (hist.length < 2 ) return ; 
const laneH = height / 4 ; 
const pad = laneH * 0.12 ; 
// robust auto scale from recent window 
const win = constrain(floor( AUTO_SECS * max( 30 , frameRate() || 60 )), 30 , 
ring .length); 
const start = (ringIdx - win + ring.length) % ring.length; 
const scale = autoScale(start, win); 
// per-lane config 
const lanes = [ 
{ key: "a" , name: "alpha" , hue: LANE_HUES [ 0 ], scale:scale.a },

{ key: "b" , name: "beta" , hue: LANE_HUES [ 1 ], scale:scale.b }, 
{ key: "t" , name: "theta" , hue: LANE_HUES [ 2 ], scale:scale.t }, 
{ key: "d" , name: "delta" , hue: LANE_HUES [ 3 ], scale:scale.d }, 
]; 
for ( let i = 0 ; i < lanes.length; i++) { 
const laneTop = i * laneH; 
const baseY = laneTop + laneH * 0.5 ; 
// baseline 
stroke( 0 , 0 , 70 , 0.35 ); 
strokeWeight( 1 ); 
line( 0 , baseY, width, baseY); 
// label 
noStroke(); 
fill( 0 , 0 , 95 ); 
textSize( 12 ); 
textAlign( LEFT , TOP ); 
const isTarget = lanes[i].name === target.band; 
const label = ` ${lanes[i].name} ± ${to2(lanes[i].scale)} ${isTarget ? " thr " + 
to2 (target.threshold) : "" } ` ; 
text(label, 8 , laneTop + 6 );

// target threshold line for the active band 
if (isTarget && target.enabled) { 
const thr = lanes[i].scale * target.threshold; 
stroke( 55 , 60 , 100 , 0.6 ); 
strokeWeight( 2 ); 
const yThr = baseY - map(thr, 0 , lanes[i].scale, 0 , laneH * 0.35 ); 
line( 0 , yThr, width, yThr); 
} 
// wave 
stroke(lanes[i].hue, 70 , 90 , 0.95 ); 
strokeWeight( 2 ); 
noFill(); 
beginShape(); 
for ( let j = 0 ; j < hist.length; j++) { 
const h = hist[j]; 
const x = map(j, 0 , hist.length - 1 , 0 , width); 
const val = h[lanes[i].key]; 
const y = baseY - map(val, 0 , lanes[i].scale, 0 , laneH * 0.35 ); 
vertex(x, constrain(y, laneTop + pad, laneTop + laneH - pad)); 
} 
endShape(); 
// live dot

const live = hist[hist.length - 1 ][lanes[i].key]; 
const yLive = baseY - map(live, 0 , lanes[i].scale, 0 , laneH * 0.35 ); 
noStroke(); 
fill(lanes[i].hue, 80 , 100 ); 
ellipse(width - 6 , constrain(yLive, laneTop + pad, laneTop + laneH - pad), 6 ); 
} 
} 
function autoScale(startIdx, count) { 
// 95th percentile per band for a stable screen scale 
const A =[], B =[], T =[], D =[]; 
for ( let k = 0 ; k < count; k++) { 
const idx = (startIdx + k) % ring.length; 
const r = ring[idx]; 
A .push(r.a); B .push(r.b); T .push(r.t); D .push(r.d); 
} 
A .sort((x,y)=>x-y); B .sort((x,y)=>x-y); T .sort((x,y)=>x-y); D .sort((x,y)=>x-y); 
const q = arr => arr[ Math .floor(arr.length* 0.95 )] || 1 ; 
const clampMin = 0.2 ; 
return { 
a: max(q( A ), clampMin), 
b: max(q( B ), clampMin), 
t: max(q( T ), clampMin), 
d: max(q( D ), clampMin),

}; 
} 
function drawTargetBar() { 
if (!target.enabled) return ; 
const last = hist[hist.length - 1 ]; 
if (!last) return ; 
const v = target.band === "alpha" ? last.a : 
target.band === "beta" ? last.b : 
target.band === "theta" ? last.t : last.d; 
const pct = constrain(v / max( 0.0001 , target.threshold), 0 , 1 ); 
const w = width * 0.6 ; 
const h = 12 ; 
const x = width * 0.2 ; 
const y = height - 28 ; 
noStroke(); 
fill( 0 , 0 , 20 , 0.7 ); 
rect(x, y, w, h, 8 ); 
fill( 140 , 70 , 80 , 0.9 );

rect(x, y, w * pct, h, 8 ); 
// hold progress 
const holdPct = constrain(target.held / HOLD_SECS , 0 , 1 ); 
fill( 60 , 60 , 100 , 0.6 ); 
rect(x, y - 6 , w * holdPct, 3 , 6 ); 
// label 
fill( 0 , 0 , 95 ); 
textSize( 12 ); 
textAlign( CENTER , BOTTOM ); 
text( `target ${target.band} thr ${to2(target.threshold)} held 
${target.held.toFixed( 1 )} s hits ${target.hits} ` , x + w / 2 , y - 8 ); 
} 
function drawHUD() { 
const pad = 10 ; 
const boxW = 262 ; 
const boxH = 138 ; 
noStroke(); 
fill( 0 , 0 , 0 , 0.35 ); 
rect(pad, pad, boxW, boxH, 10 ); 
fill( 0 , 0 , 95 );

textSize( 12 ); 
textAlign( LEFT , TOP ); 
let y = pad + 8 ; 
text( `alpha ${to2(smooth.alpha)} beta ${to2(smooth.beta)} ` , pad + 10 , y); y += 16 ; 
text( `theta ${to2(smooth.theta)} delta ${to2(smooth.delta)} ` , pad + 10 , y); y += 
16 ; 
text( `attention ${to2(smooth.attention)} meditation ${to2(smooth.meditation)} ` , pad 
+ 10 , y); y += 16 ; 
text( `target ${target.band} thr ${to2(target.threshold)} ` , pad + 10 , y); y += 16 ; 
text( `space pause G grid click lane sets target` , pad + 10 , y); y += 16 ; 
text( `[ ] threshold T toggle trainer` , pad + 10 , y); 
} 
// ------------- logic ------------- 
function updateTargetHold() { 
const last = hist[hist.length - 1 ]; 
if (!last) return ; 
const v = target.band === "alpha" ? last.a : 
target.band === "beta" ? last.b : 
target.band === "theta" ? last.t : last.d; 
const dt = 1 / max( 1 , frameRate()); 
if (v >= target.threshold) {

target.held += dt; 
if (target.held >= HOLD_SECS ) { 
target.hits += 1 ; 
target.held = 0 ; 
} 
} else { 
target.held = max( 0 , target.held - dt * 0.5 ); 
} 
} 
// ------------- input ------------- 
function keyPressed() { 
if (key === ' ' ) paused = !paused; 
if (key === 'G' ) showGrid = !showGrid; 
if (key === 'T' ) target.enabled = !target.enabled; 
if (key === '[' ) target.threshold = max( 0.05 , target.threshold - 0.02 ); 
if (key === ']' ) target.threshold = min( 0.95 , target.threshold + 0.02 ); 
} 
function mousePressed() { 
// click a lane to make it the target band 
const laneH = height / 4 ; 
const i = floor(mouseY / laneH); 
if (i < 0 || i > 3 ) return ;

target.band = LANE_NAMES [i]; 
target.held = 0 ; 
} 
// ------------- utility ------------- 
function to2(v) { return Number (v).toFixed( 2 ); } 
// simple sim so it runs without a headset 
function simEEG() { 
const t = frameCount; 
return { 
alpha: noise(t* 0.010 )* 0.95 , 
beta: noise( 1000 +t* 0.014 )* 0.95 , 
theta: noise( 2000 +t* 0.008 )* 0.95 , 
delta: noise( 3000 +t* 0.005 )* 0.95 , 
attention: 0.4 + 0.6 *noise( 4000 +t* 0.020 ), 
meditation: 0.4 + 0.6 *noise( 5000 +t* 0.017 ) 
}; 
}
