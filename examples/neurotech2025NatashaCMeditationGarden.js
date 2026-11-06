/**
 * @id neurotech2025NatashaCMeditationGarden
 * @title Meditation Garden with Fireflies (Natasha Chemello)
 * @category 2025 Neurotech Class Catalogue
 * @order 65
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Tranquil day-to-dusk garden with swaying flowers, drifting clouds, and glowing fireflies driven by Alpha, Theta, and Attention.
 */
// 🌿 Neurofeedback Meditation Garden — Smooth & Responsive Version 🌿 
// Smooth noise motion + speed up at attention = 1.0, slow down at meditation = 1.0. 
// For BrainImation EEG environment (uses eegData.meditation & eegData.attention). 
let flowers = []; 
let clouds = []; 
let fireflies = []; 
function setup() { 
colorMode(HSB, 360, 100, 100); 
noiseSeed(random(1000)); 
for (let i = 0; i < 25; i++) { 
flowers.push({ 
x: random(width), 
y: random(height * 0.85, height * 0.95), 
baseY: 0, 
size: random(20, 40), 
bloom: 0.5, 
swayOffset: random(1000), 
hue: random(250, 285) 
}); 
} 
for (let f of flowers) f.baseY = f.y; 
for (let i = 0; i < 14; i++) { 
clouds.push({ 
x: random(width), 
y: random(height * 0.1, height * 0.4), 
size: random(120, 250), 
noiseOffset: random(1000), 
speedNoise: random(500) 
}); 
} 
for (let i = 0; i < 25; i++) { 
fireflies.push({ 
x: random(width), 
y: random(height * 0.7, height), 
flicker: random(TWO_PI), 
hue: random(50, 70), 
moveNoise: random(1000) 
}); 
}

} 
function draw() { 
let calm = eegData.meditation; // alpha 
let focus = eegData.attention; // beta 
// Map base speed from both brain states: 
// Calm slows time, focus accelerates it. Maximum boost at focus=1, calm=0. 
let base = map(focus, 0, 1, 1, 7); // up to 7× faster attention 
let slow = map(calm, 0, 1, 1, 0.25); // quarter speed at full calm 
let tSpeed = base * slow; 
drawSky(calm, focus); 
drawClouds(tSpeed); 
drawGround(); 
drawFlowers(calm, focus, tSpeed); 
drawFireflies(calm, focus, tSpeed); 
drawHUD(calm, focus); 
} 
function drawSky(calm, focus) { 
let hue = lerp(200, 255, calm); 
let sat = lerp(70, 40, focus); 
let bright = lerp(90, 60, calm); 
background(hue, sat, bright); 
} 
function drawClouds(tSpeed) { 
noStroke(); 
for (let c of clouds) { 
c.noiseOffset += 0.0015 * tSpeed; // smoother noise drift 
c.x = map(noise(c.noiseOffset), 0, 1, -c.size, width + c.size); 
c.y += sin(frameCount * 0.002 * tSpeed) * 0.2; // minor float motion 
fill(200, 20, 95, 0.6); 
ellipse(c.x, c.y, c.size * 0.8, c.size * 0.6); 
ellipse(c.x + c.size * 0.25, c.y + 10, c.size * 0.6, c.size * 0.4); 
ellipse(c.x - c.size * 0.25, c.y + 10, c.size * 0.6, c.size * 0.4); 
} 
} 
function drawGround() { 
noStroke(); 
fill(115, 35, 75);

rect(0, height * 0.8, width, height * 0.25); 
} 
function drawFlowers(calm, focus, tSpeed) { 
for (let f of flowers) { 
// Gradual bloom interpolation 
f.bloom = lerp(f.bloom, calm, 0.08); 
// Perlin-smooth sway influenced by speed 
f.swayOffset += 0.002 * tSpeed; 
let sway = map(noise(f.swayOffset), 0, 1, -10 * f.bloom, 10 * f.bloom); 
stroke(120, 60, 45); 
strokeWeight(2 + 4 * f.bloom); 
line(f.x + sway, f.baseY, f.x, f.baseY - f.bloom * 65); 
noStroke(); 
push(); 
translate(f.x + sway, f.baseY - f.bloom * 65); 
for (let i = 0; i < 6; i++) { 
let hueShift = map(focus, 0, 1, -10, 10); 
fill(f.hue + hueShift, 55, 95, 0.8); 
push(); 
rotate((i * TWO_PI) / 6 + noise(frameCount * 0.0015 * tSpeed)); 
ellipse(0, -f.size * 0.8, f.size, f.size * 1.6); 
pop(); 
} 
fill(55, 90, 95, 0.9); 
ellipse(0, 0, f.size * 0.5 + f.bloom * 10); 
pop(); 
} 
} 
function drawFireflies(calm, focus, tSpeed) { 
let count = map(calm, 0, 1, 5, 25); 
for (let i = 0; i < count; i++) { 
let ff = fireflies[i]; 
ff.flicker += 0.05 * tSpeed; 
ff.moveNoise += 0.001 * tSpeed; 
let flicker = (sin(ff.flicker) + 1) / 2; 
let wander = map(noise(ff.moveNoise), 0, 1, -5, 5);

fill(ff.hue, 80, 100, flicker); 
noStroke(); 
ellipse(ff.x + wander, ff.y + sin(frameCount * 0.01 * tSpeed) * 2, 4 + flicker * 3); 
} 
} 
function drawHUD(calm, focus) { 
noStroke(); 
fill(0, 0, 20, 0.7); 
rect(0, 0, width, 70); 
fill(0, 0, 100); 
textSize(16); 
textAlign(LEFT, TOP); 
text("Meditation (Alpha): " + calm.toFixed(2), 20, 10); 
text("Attention (Beta): " + focus.toFixed(2), 20, 30); 
text("At full focus, the world races; in calm, time slows.", 20, 50); 
}
