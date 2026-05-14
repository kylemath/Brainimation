/**
 * @id particles
 * @title Brain Particles
 * @category Particle Systems
 * @order 11
 *
 * Auto-split from index.html.
 */
// Brain particle system
let particles = [];

function setup() {
  colorMode(HSB, 360, 100, 100);
  
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      vx: random(-2, 2),
      vy: random(-2, 2),
      life: 1.0
    });
  }
}

function draw() {
  background(0, 0, 5, 0.1);
  
  for (let p of particles) {
    // Movement influenced by brain waves
    p.vx += (random(-1, 1) * eegData.alpha * 0.1);
    p.vy += (random(-1, 1) * eegData.beta * 0.1);
    
    p.x += p.vx;
    p.y += p.vy;
    
    // Wrap around
    if (p.x < 0) p.x = width;
    if (p.x > width) p.x = 0;
    if (p.y < 0) p.y = height;
    if (p.y > height) p.y = 0;
    
    // Draw particle
    let hue = map(eegData.theta, 0, 1, 180, 300);
    fill(hue, 70, 90, p.life);
    noStroke();
    ellipse(p.x, p.y, 5 + eegData.gamma * 10);
    
    p.life *= 0.995;
    if (p.life < 0.1) p.life = 1.0;
  }
}
