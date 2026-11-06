/**
 * @id neurotech2025EllaTEegPacMan
 * @title EEG Pac-Man Pellet Collector (Ella Thorsen-Bell)
 * @category 2025 Neurotech Class Catalogue
 * @order 26
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Arcade Pac-Man mini-game where Alpha and Beta brainwaves steer Pac-Man across the arena to chomp glowing pellets.
 */
let pacman; 
let pellets = []; 
let score = 0 
function setup() { 
colorMode(HSB, 360, 100, 100); 
pacman = { 
 x: width / 2, 
 y: height / 2, 
 size: 40 
}; 
// Create pellets 
for (let i = 0; i < 30; i++) { 
 pellets.push({ 
 x: random(20, width-20), 
 y: random(20, height-20), 
 eaten: false 
 }); 
} 
} 
function draw() { 
background(0, 0, 5); 
 // --- EEG CONTROL --- 
let dx = map(eegData.alpha, 0, 1, -3, 3); 
let dy = map(eegData.beta, 0, 1, -3, 3); 
pacman.x += dx; 
pacman.y += dy; 
// Keep inside screen 
pacman.x = constrain(pacman.x, 0, width); 
pacman.y = constrain(pacman.y, 0, height); 
//Draw Pac-Man 
fill(50, 100, 100); 
let open = abs(sin(frameCount * 0.2)) * 40; // mouth opening angle
arc(
  pacman.x, pacman.y,
  pacman.size, pacman.size,
  radians(open),
  radians(360 - open),
  PIE
); 
// Draw pellets 
fill(200, 80, 100); 
for (let p of pellets) { 
 if (!p.eaten) { 
 ellipse(p.x, p.y, 10); 
 // collision detection 
 if (dist(pacman.x, pacman.y, p.x, p.y) < 20) {  p.eaten = true; 
 score++; 
 } 
 } 
} 
// Score display 
fill(120, 0, 100); 
textSize(20); 
text("Score: " + score, 20, 30); 
}
