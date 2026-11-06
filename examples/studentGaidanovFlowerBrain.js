/**
 * @id studentGaidanovFlowerBrain
 * @title Popping Meadow Flower (Andrada Gaidanov)
 * @category 2022 NeuroArt Class Gallery
 * @order 7
 *
 * Student NeuroArt Project by Andrada Gaidanov.
 * Random flowers bloom across a green meadow with petal size and color driven by Alpha and Theta waves.
 */
function setup() {
  colorMode(RGB, 255);
  frameRate(2);
}

function draw() {
  background(144, 238, 144);
  let flowerX = random(80, width - 80);
  let flowerY = random(80, height - 80);
  let petalSize = 20 + eegData.getChannelBand('alpha', 1) * 140;
  let petalDistance = petalSize * 0.7;

  stroke(0);
  strokeWeight(1.5);
  fill(eegData.getChannelBand('alpha', 2) * 255, 0, eegData.getChannelBand('theta', 3) * 255);

  // 4 outer petals
  circle(flowerX - petalDistance, flowerY - petalDistance, petalSize);
  circle(flowerX + petalDistance, flowerY - petalDistance, petalSize);
  circle(flowerX - petalDistance, flowerY + petalDistance, petalSize);
  circle(flowerX + petalDistance, flowerY + petalDistance, petalSize);

  // Center petal
  fill(218, 165, 32);
  circle(flowerX, flowerY, petalSize);
}
