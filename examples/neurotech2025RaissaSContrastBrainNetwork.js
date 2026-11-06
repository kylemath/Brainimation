/**
 * @id neurotech2025RaissaSContrastBrainNetwork
 * @title High-Contrast Brain Particle Network (Raissa Shariff)
 * @category 2025 Neurotech Class Catalogue
 * @order 72
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Connected neural particle network that shifts contrast, link density, and speed with Attention and Meditation.
 */
// 🧠 BrainImation: High-Contrast Brain Particles (final, no presets) 
// Big changes over 30–60s: widened density, stronger color drift, boosted calm vs.  focus contrast. 
let pts = []; 
let t = 0 ; 
// smoothed EEG (EMA) 
const S = { att: 0 , alp: 0 , the: 0 , bet: 0 , med: 0 , connected: false }; 
const EMA = 0.15 ; // smoothing for signals 
let targetSmooth = 120 ; // eased particle count 
function setup(){ 
colorMode( HSB , 360 , 100 , 100 , 1 ); 
noStroke(); 
for ( let i= 0 ;i< 120 ;i++) pts.push(makeP()); 
} 
function draw(){ 
// --- safe EEG read + normalize --- 
const e = ( typeof eegData!== 'undefined' ) ? eegData : {}; 
S .att = lerp( S .att, clamp01(norm(e.attention)), EMA ); 
S .alp = lerp( S .alp, clamp01(norm(e.alpha)), EMA ); 
S .the = lerp( S .the, clamp01(norm(e.theta)), EMA ); 
S .bet = lerp( S .bet, clamp01(norm(e.beta)), EMA ); 
S .med = lerp( S .med, clamp01(norm(e.meditation)), EMA ); 
S .connected = !!e.connected; 
// --- contrast boost (stronger than before) --- 
const A = expand( S .att, 2.2 ); // attention (focus) 
const AL = expand( S .alp, 2.5 ); // alpha (calm) 
const TH = expand( S .the, 1.6 ); 
const B = expand( S .bet, 1.6 ); 
const M = expand( S .med, 1.8 ); 
// --- particle count: MUCH wider range --- 
const target = map( A , 0 , 1 , 50 , 500 ); 
targetSmooth = lerp(targetSmooth, target, 0.06 ); 
const need = Math .round(targetSmooth);

if (pts.length < need) while (pts.length < need) pts.push(makeP()); else pts.length = 
need ; 
// --- background trails: calmer -> heavier smear --- 
const calm = clamp01( 0.6 * AL + 0.4 * M ); 
const trail = lerp( 0.08 , 0.30 , calm); 
background( 220 , 30 , 10 , trail); 
// --- stronger color/time drift so frames differ more --- 
t += 0.006 + 0.035 *( 0.6 * B + 0.4 * A ); 
const hueDrift = t * 140 ; 
// --- particles --- 
for ( const p of pts){ 
// calm ↓ jitter, focus ↑ energy 
const shake = 0.008 + 0.030 *( 0.7 *( 1 - AL ) + 0.3 * A ); 
p.vx = (p.vx + random(-shake, shake)) * 0.993 ; 
p.vy = (p.vy + random(-shake, shake)) * 0.993 ; 
p.x = (p.x + p.vx + width ) % width; 
p.y = (p.y + p.vy + height) % height; 
const hue = (p.h + hueDrift + A * 55 ) % 360 ; 
const bri = lerp( 36 , 96 , B ); 
const size = 3 + TH * 22 + AL * 2.5 ; // calm -> slightly larger 
fill(hue, 70 , bri, 0.92 ); 
ellipse(p.x, p.y, size, size); 
} 
// --- links: longer range with focus; stronger opacity when calm --- 
const maxD = lerp( 85 , 150 , A ); 
const maxD2 = maxD*maxD; 
strokeWeight( 1.6 ); 
for ( let i= 0 ;i<pts.length;i++){ 
let links = 0 ; 
const p = pts[i]; 
for ( let j=i+ 3 ; j<pts.length && links< 6 ; j+= 3 ){ 
const q = pts[j]; 
const dx=p.x-q.x, dy=p.y-q.y, d2=dx*dx+dy*dy; 
if (d2 < maxD2){ 
const d = sqrt(d2); 
const a = map(d, 0 , maxD, 0.65 , 0 ) * lerp( 0.35 , 1.0 , AL );

stroke((p.h + hueDrift)% 360 , 50 , 78 , a); 
line(p.x, p.y, q.x, q.y); 
links++; 
} 
} 
} 
noStroke(); 
if (! S .connected){ 
fill( 0 , 0 , 100 , 0.9 ); textAlign( CENTER , CENTER ); textSize( 12 ); 
text( "Simulation active — connect headset for live EEG" , width/ 2 , height- 14 ); 
} 
} 
/* ================= Helpers ================= */ 
function makeP(){ 
return { x:random(width), y:random(height), vx:random(-0.6, 0.6 ), vy:random(-0.6, 0.6 ), 
h :random( 360 ) }; 
} 
function norm(v){ return ( typeof v=== 'number' ) ? (v> 1 ? v/ 100 : v) : 0 ; } 
function clamp01(x){ return x< 0 ? 0 :x> 1 ? 1 :x; } 
// Contrast around 0.5: y = clamp(0.5 + (x-0.5)*gain) 
function expand(x, gain){ return clamp01( 0.5 + (x - 0.5 )*gain); }
