/**
 * @id neurotech2025KiaraRAlphaBetaParticles
 * @title Alpha/Beta Brain Particle Fountain (Kiara Ruda)
 * @category 2025 Neurotech Class Catalogue
 * @order 50
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * HSB particle fountain where Alpha and Beta waves control emission rate, velocity, and color.
 */
// Brain particle system 
let particles = []; 
function setup() { 
colorMode( HSB , 250 , 10 , 100 ); 
for ( let i = 0 ; i < 100 ; i++) { 
particles.push({ 
x: random(width), 
y: random(height), 
vx: random(- 9 , - 10 ), 
vy: random(- 9 , - 10 ), 
life: 1.0 
}); 
} 
} 
function draw() { 
background( 0 , 0 , 0 , 0.1 ); 
for ( let p of particles) { 
// Movement influenced by brain waves 
p.vx += (random(- 1 , 1 ) * eegData.alpha * 0.1 );

p.vy += (random(- 1 , 1 ) * eegData.beta * 0.1 ); 
p.x += p.vx * ( 1 + eegData.alpha); 
p.y += p.vy * ( 1 + eegData.alpha); 
// Wrap around 
if (p.x < 0 ) p.x = width; 
if (p.x > width) p.x = 0 ; 
if (p.y < 0 ) p.y = height; 
if (p.y > height) p.y = 0 ; 
// Draw particle 
let hue; 
if (eegData.alpha > 0.7 ) { 
hue = 60 
} else { 
hue = map(eegData.theta, 0 , 1 , 180 , 300 ) 
} 
fill(hue, 80 , 90 , p.life); 
noStroke(); 
ellipse(p.x, p.y, 5 + eegData.gamma * 35 ); 
p.life *= 0.995 ; 
if (p.life < 0.1 ) p.life = 1.0 ; 
} 
}
