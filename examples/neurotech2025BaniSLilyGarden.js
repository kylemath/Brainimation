/**
 * @id neurotech2025BaniSLilyGarden
 * @title Lily of the Valley & Butterfly Garden (Bani Sekhon)
 * @category 2025 Neurotech Class Catalogue
 * @order 17
 *
 * PSYCH 403A1 (Fall 2025) Student BrainImation Catalogue.
 * Botanical neurofeedback garden where Lily of the Valley bell flowers bloom and butterflies flutter in response to EEG band activity.
 */
let plants = [];
let rainDrops = [];
let butterflies = [];
let numPlants = 7;
let lilyProgress = 0;

// -------------------- PLANT CLASS --------------------
class Plant {
  constructor(x) {
    this.x = x;
    this.height = random(100, 140);
    this.bloom = 0;
  }

  grow(amount) {
    this.height += amount;
    this.height = constrain(this.height, 100, 280);
    this.bloom += amount * 0.08;
    this.bloom = constrain(this.bloom, 0, 1);
  }

  display() {
    let topY = height - this.height;
    
    // stem
    stroke(110, 70, 45);
    strokeWeight(6);
    line(this.x, height, this.x, topY);
    
    // leaves
    noStroke();
    fill(110, 60, 55);
    ellipse(this.x - 20, topY + this.height * 0.6, 40, 18);
    ellipse(this.x + 20, topY + this.height * 0.5, 40, 18);
    
    // flower
    let size = 20 + this.bloom * 35;
    fill(330, 50, 90);
    ellipse(this.x, topY, size, size);
    fill(50, 80, 95);
    ellipse(this.x, topY, size * 0.3);
  }
}

// -------------------- BUTTERFLY --------------------
class Butterfly {
  constructor() {
    this.x = width / 2 + random(-20, 20);
    this.y = height - 220;
    this.vx = random(-0.5, 0.5);
    this.vy = random(-1.2, -0.6);
    this.life = 255;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= 2;
  }

  display() {
    noStroke();
    fill(300, 40, 100, this.life);
    ellipse(this.x - 5, this.y, 10, 6);
    ellipse(this.x + 5, this.y, 10, 6);
  }
}

// -------------------- LILY OF THE VALLEY --------------------
function drawLilyOfTheValley(progress) {
  let cx = width / 2;
  let baseY = height - 55;
  
  // stem
  let stemHeight = map(progress, 0, 0.5, 0, 220, true);
  stroke(115, 60, 45);
  strokeWeight(6);
  line(cx, baseY, cx, baseY - stemHeight);
  let topY = baseY - stemHeight;
  
  // leaves (grow gradually)
  if (progress > 0.2) {
    let leafGrow = map(progress, 0.2, 1, 0, 1, true);
    noStroke();
    fill(115, 60, 40);
    ellipse(cx - 45, baseY - 80, 50 * leafGrow, 200 * leafGrow);
    ellipse(cx + 25, baseY - 90, 40 * leafGrow, 170 * leafGrow);
  }
  
  // bells
  if (progress > 0.4) {
    let bellCount = floor(map(progress, 0.4, 1, 1, 7, true));
    for (let i = 0; i < bellCount; i++) {
      let side = (i % 2 === 0) ? -1 : 1;
      let offsetX = side * 26;
      let y = topY + 28 + i * 26;
      stroke(120, 30, 40);
      strokeWeight(2);
      line(cx, y - 10, cx + offsetX, y);
      noStroke();
      fill(0, 0, 100);
      ellipse(cx + offsetX, y + 12, 24, 20);
      arc(cx + offsetX, y + 16, 26, 18, 0, PI);
    }
  }
}

// -------------------- SETUP --------------------
function setup() {
  colorMode(HSB, 360, 100, 100);
  for (let i = 0; i < numPlants; i++) {
    // leave center empty
    if (i === floor(numPlants / 2)) continue;
    let x = (i + 1) * (width / (numPlants + 1));
    plants.push(new Plant(x));
  }
}

// -------------------- DRAW --------------------
function draw() {
  background(100, 15, 95);
  
  let alpha = eegData.alpha;
  let beta = eegData.beta;
  let attention = eegData.attention;
  let state = "Garden Growing";
  let sunGrow = 0;
  let rainGrow = 0;
  
  // 🌧️ Rain = slow growth (stress)
  if (beta > 0.6 && alpha < 0.35) {
    state = "Stress — Rain (Slow Growth)";
    rainGrow = 0.05;
    for (let i = 0; i < 6; i++) {
      rainDrops.push({
        x: random(width),
        y: random(-100, 0),
        speed: random(12, 18)
      });
    }
  }
  
  // ☀️ Sun = fast growth (focus)
  if (beta > 0.5 && alpha >= 0.4) {
    state = "Focus — Sunlight (Fast Growth)";
    sunGrow = 0.12;
    noStroke();
    fill(50, 90, 100);
    ellipse(width - 120, 120, 220);
  }
  
  // grow plants
  let allBloomed = true;
  for (let p of plants) {
    p.grow(sunGrow + rainGrow);
    p.display();
    if (p.bloom < 1) allBloomed = false;
  }
  
  // 🌸 Lily of the Valley appears LAST
  if (allBloomed && alpha > 0.5 && attention > 0.5 && sunGrow > 0) {
    state = "Meditative Focus — Lily of the Valley";
    lilyProgress += 0.005;
    lilyProgress = constrain(lilyProgress, 0, 1);
  }
  if (lilyProgress > 0) {
    drawLilyOfTheValley(lilyProgress);
  }
  
  // 🦋 Butterflies at completion
  if (lilyProgress > 0.95 && frameCount % 15 === 0) {
    butterflies.push(new Butterfly());
  }
  for (let i = butterflies.length - 1; i >= 0; i--) {
    butterflies[i].update();
    butterflies[i].display();
    if (butterflies[i].life <= 0) butterflies.splice(i, 1);
  }
  
  // rain drawing
  stroke(210, 40, 100);
  strokeWeight(3);
  for (let i = rainDrops.length - 1; i >= 0; i--) {
    rainDrops[i].y += rainDrops[i].speed;
    line(rainDrops[i].x, rainDrops[i].y,
         rainDrops[i].x, rainDrops[i].y + 18);
    if (rainDrops[i].y > height) rainDrops.splice(i, 1);
  }
  
  // ground
  fill(100, 40, 40);
  rect(0, height - 45, width, 45);
  
  // state text
  fill(0, 0, 20);
  textAlign(CENTER);
  textSize(26);
  text(state, width / 2, 40);
}
