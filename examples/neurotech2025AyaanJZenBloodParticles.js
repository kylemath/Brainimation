/**
 * @id neurotech2025AyaanJZenBloodParticles
 * @title Zen vs. Stress Particle Field (Ayaan Jimale)
 * @category 2025 Neurotech Class Catalogue
 * @order 10
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Dual-state particle system contrasting calm rainbow meditation orbits on a dark canvas against fast crimson stress bursts.
 */
// Brain particle system 
let particles = []; 
function setup() { 
// HSB in 0..1 (you already had this) 
colorMode( HSB , 1 , 1 , 1 ); 
for ( let i = 0 ; i < 100 ; i++) { 
particles.push({ 
x: random(width), 
y: random(height), 
// base fast velocities (your choice kept) 
vx: random( 0 , 50 ), 
vy: random(- 2 , 50 ), 
life: 1.0 , 
seed: random( 1 ) // NEW: per-particle hue for rainbow 
}); 
} 
} 
function draw() { 
// Use BrainImation sliders: Attention≈beta, Meditation≈alpha 
const alpha = (eegData.meditation ?? eegData.alpha ?? 0 ); 
const beta = (eegData.attention ?? eegData.beta ?? 0 ); 
// stress logic: true if attention > meditation 
const stressed = beta > alpha + 0.02 ; // tiny margin avoids flicker 
// BG: stressed = white, calm = dark 
if (stressed) background( 0 , 0 , 1 , 0.15 ); 
else background( 0 , 0 , 0.06 , 0.10 ); 
// speed scale: calm slow, stressed fast 
const speed = stressed ? 1.0 : 0.18 ; // <<< slow when calm 
for ( let p of particles) { 
// Movement influenced by brain waves (your logic kept) 
p.vx += (random(- 1 , 1 ) * (eegData.alpha ?? alpha) * 0.1 ); 
p.vy += (random(- 1 , 1 ) * (eegData.beta ?? beta) * 0.1 ); 
// Apply speed scaling (NEW) 
p.x += p.vx * speed; 
p.y += p.vy * speed; 
// Wrap around 
if (p.x < 0 ) p.x = width; 
if (p.x > width) p.x = 0 ; 
if (p.y < 0 ) p.y = height; 
if (p.y > height) p.y = 0 ; 
// Color: stressed = red, calm = rainbow (NEW) 
let hue = stressed ? 0.0 : (p.seed + frameCount * 0.002 ) % 1.0 ; 
fill(hue, 0.9 , 0.95 , p.life); 
noStroke(); 
ellipse(p.x, p.y, 5 + (eegData.gamma ?? 0 ) * 10 ); 
// life (your fade kept) 
p.life *= 0.995 ; 
if (p.life < 0.1 ) p.life = 1.0 ; 
} 
}
