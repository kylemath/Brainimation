/**
 * @id neurotech2025HannahCBloomingMandala
 * @title Blooming Neural Mandala (Hannah Cooper)
 * @category 2025 Neurotech Class Catalogue
 * @order 33
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Multi-layered blooming mandala flower whose petals expand with Alpha meditation and shimmer with Beta focus.
 */
// Neural mandala 
// Neural mandala — EEG-reactive visualization by Hannah Cooper 
// This animation transforms EEG brainwave data into a colorful, pulsating mandala. 
// The piece visualizes focus (attention), relaxation (alpha), and calmness  (meditation) 
// through color, brightness, size, and rotational speed. 
let angle = 0 ; 
function setup() { 
// Use HSB color mode for dynamic hue control (easier to shift colors smoothly) 
colorMode( HSB , 360 , 100 , 100 ); 
noStroke(); // Clean, glowing look with no outlines 
} 
// Simulated EEG data for testing (BrainImation will replace these values in  real-time) 
let fallbackEegData = { 
attention: 0.6 , // Represents mental focus or engagement (0–1) 
alpha: 0.5 , // Represents relaxation or calm wakefulness (0–1) 
meditation: 0.4 // Represents deep calm and reduced stress (0–1) 
}; 
function draw() { 
// Create a faint trail effect for smooth animation persistence 
background( 0 , 0 , 0 , 0.05 ); 
// Center the mandala on the screen 
translate(width / 2 , height / 2 ); 
let layers = 6 ; // Number of concentric circular layers (rings of petals) 
// Loop through each layer to build the mandala structure 
for ( let layer = 0 ; layer < layers; layer++) { 
// Radius grows with each layer and expands with meditation (flower “blooming”) 
let radius = 30 + layer * 40 * ( 1 + eegData.meditation); 
// Each layer has more points (petals) as it expands outward 
let points = 6 + layer * 2 ; 
// Draw each point (petal) in the circular layer 
for ( let i = 0 ; i < points; i++) { 
// Determine angular position around the circle

let a = angle + ( TWO_PI / points) * i; 
// Add gentle pulsing motion using sine waves for organic breathing effect 
let pulse = sin(angle * 3 + i * 0.5 + layer) * 10 ; 
// Convert polar coordinates to (x, y) with pulse offset 
let x = cos(a) * (radius + pulse); 
let y = sin(a) * (radius + pulse); 
// Visual characteristics based on EEG data and motion 
let hue = (angle * 40 + layer * 60 + i * 15 ) % 360 ; // Color rotation by angle +  layer depth 
let brightness = 40 + eegData.attention * 60 ; // More attention = brighter  colors 
let size = 5 + eegData.alpha * layer * 2 ; // More alpha = larger petal  size (relaxed flow) 
// Conceptual variables for extended design ideas (petal stretching) 
let petalWidth = 10 + eegData.alpha * 20 ; 
let petalHeight = 30 + eegData.alpha * 50 + pulse; 
// Draw each petal point with its hue, saturation, and brightness 
fill(hue, 80 , brightness, 0.9 ); 
ellipse(x, y, size); 
} 
} 
// Draw the mandala’s center — its size pulses with meditation level (calmness) 
fill( 50 , 80 , 90 , 0.9 ); 
let centerSize = 50 + eegData.meditation * 100 * sin(angle * 2 ); 
ellipse( 0 , 0 , centerSize); 
// Rotation speed adjusts with the center’s size (more calmness = smoother movement) 
// constrain() prevents extreme speed changes 
let clampedCenter = constrain(centerSize, 30 , 170 ); 
let speed = map(clampedCenter, 30 , 170 , 0.003 , 0.035 ); 
angle += speed; // Update global rotation angle 
} 
// Automatically resize canvas when window changes size 
function windowResized() { 
resizeCanvas(windowWidth, windowHeight);
}
