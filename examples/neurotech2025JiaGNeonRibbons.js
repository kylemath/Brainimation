/**
 * @id neurotech2025JiaGNeonRibbons
 * @title Expanding Alpha Neon Ribbons (Jia Guina)
 * @category 2025 Neurotech Class Catalogue
 * @order 46
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Concentric wavy neon ribbons that radiate from the center of the canvas at a rate and brightness driven by Alpha waves.
 */
function setup() {
  createCanvas(width, height);
  waves = [];
  background(0);
}

let waves = [];

function draw() {

background(0, 0, 0, 10); // darker bg, more trails for neon effect

// Add new wave

if (typeof eegData !== undefined && eegData.alpha !== undefined) {

if (frameCount % 6 === 0) { // more frequent for smoother ribbons

waves.push({

x: width / 2,

y: height / 2,

r: 0,

alpha: constrain(eegData.alpha, 0, 1),

phase: random(TWO_PI),

colorOffset: random(360) // for multiple neon colors

});

}

}

// Draw waves

for (let i = waves.length - 1; i >= 0; i--) {

let w = waves[i];

drawNeonRibbon(w.x, w.y, w.r, w.alpha, w.phase, w.colorOffset);

w.r += w.alpha * 12 + 2; // faster expansion

w.alpha *= 0.97;

w.phase += 0.03; // flowing rotation

if (w.alpha < 0.01) waves.splice(i, 1);

}

}

// Draw glowing, overlapping neon ribbons

function drawNeonRibbon(x, y, r, alpha, phase, colorOffset) {

push();

translate(x, y);

noFill();

let layers = 5;

for (let g = layers; g > 0; g--) {

let glowAlpha = alpha * (g / layers) * 0.25;

let glowWeight = g * 2; // thicker for neon effect

let hueVal = (200 + g * 10) % 360; // shifts through neon hues

let col = color(`hsl(${hueVal}, 90%, 70%)`);



stroke(red(col), green(col), blue(col), glowAlpha * 255);

strokeWeight(glowWeight);

drawWavyCircle(r + g * 8, phase); // offset for layered ribbon

}

// Core bright line

let col = color(`hsl(${colorOffset}, 100%, 85%)`);

stroke(red(col), green(col), blue(col), alpha * 255);

strokeWeight(3);

drawWavyCircle(r, phase);

pop();

}

// Creates a wavy circular shape

function drawWavyCircle(r, phase) {

noFill();

beginShape();

let points = 300;

for (let a = 0; a < TWO_PI; a += TWO_PI / points) {

let wave = sin(a * 8 + phase) * 16; // bigger waviness for ribbon effect

let x = (r + wave) * cos(a);

let y = (r + wave) * sin(a);

vertex(x, y);

}

endShape(CLOSE);

}
