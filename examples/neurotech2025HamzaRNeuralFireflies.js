/**
 * @id neurotech2025HamzaRNeuralFireflies
 * @title Neural Fireflies Swarm (Hamza Razzo)
 * @category 2025 Neurotech Class Catalogue
 * @order 30
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Glowing firefly swarm whose drift speed, pulse rate, and warm bioluminescent hues respond to live EEG band power.
 */
// Neural Fireflies — simple glow dots that react to meditation/attention 
let particles = []; 
function setup() { 
// HSB in 0..1 (same as your format) 
colorMode(HSB, 1, 1, 1); 
for (let i = 0; i < 120; i++) { 
particles.push({ 
x: random(width), 
y: random(height), 
vx: random(-0.6, 0.6), 
vy: random(-0.6, 0.6), 
seed: random(1), // per-firefly hue offset 
life: 1.0 
}); 
} 
} 
function draw() { 
// Use BrainImation sliders: Attention≈beta, Meditation≈alpha 
const alpha = (eegData.meditation ?? eegData.alpha ?? 0); // calm 
const beta = (eegData.attention ?? eegData.beta ?? 0); // focus 
// stress logic: true if attention > meditation 
const stressed = beta > alpha + 0.02; // tiny margin avoids flicker 
// BG: calm = dark night, stressed = brighter 
if (stressed) background(0, 0, 1, 0.15); 
else background(0, 0, 0.06, 0.10); 
// Motion/appearance controls (kept very simple) 
const speed = stressed ? 1.0 : 0.25; // calm slows drift 
const size = 3 + alpha * 7 + (eegData.gamma ?? 0) * 4; // calm → bigger 
const glow = 0.25 + beta * 0.6; // focus → brighter halo 
for (let p of particles) { 
// gentle drift; a touch more motion with focus 
p.vx += random(-0.2, 0.2) * (0.05 + beta * 0.15); 
p.vy += random(-0.2, 0.2) * (0.05 + beta * 0.15); 
p.x += p.vx * speed; 
p.y += p.vy * speed; 
// wrap around 
if (p.x < 0) p.x = width; 
if (p.x > width) p.x = 0; 
if (p.y < 0) p.y = height; 
if (p.y > height) p.y = 0; 
// color: calm → cool green/teal; stressed → warm orange/red 
let baseHue = stressed ? 0.06 : 0.35; // warm vs cool 
let hue = (baseHue + p.seed * 0.08 + beta * 0.10) % 1.0; 
// draw a soft glow (big faint circle) + bright core (small circle)

noStroke(); 
fill(hue, stressed ? 0.9 : 0.7, 1.0, glow * 0.25); // outer glow 
ellipse(p.x, p.y, size * 3.2); 
fill(hue, stressed ? 0.95 : 0.8, 1.0, 0.95); // inner core 
ellipse(p.x, p.y, size); 
// gentle life fade/refresh to vary glow slightly (optional) 
p.life *= 0.997; 
if (p.life < 0.2) { p.life = 1.0; } 
} 
}
