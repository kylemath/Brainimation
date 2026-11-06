/**
 * @id studentRyuTrippyFlower
 * @title Trippy Pulsing Flower (Nayoung Ryu)
 * @category 2022 NeuroArt Class Gallery
 * @order 21
 *
 * Student NeuroArt Project by Nayoung Ryu.
 * Funky layered flower that pulses and blooms with changes in Alpha power.
 */
function setup() {
  colorMode(RGB, 255);
  background(105, 118, 67);
  noStroke();
}

function draw() {
  let ALPHA = max(0.35, eegData.getChannelBand('alpha', 0) * 3.5);

  function drawFlower(flowerX, flowerY, flowerSize) {
    flowerSize = flowerSize / ALPHA;

    // Light green leaves
    push();
    fill(184, 178, 100, 5);
    translate(flowerX, flowerY);
    for (let i = 1; i <= 12; i++) {
      ellipse(0, flowerSize, flowerSize, flowerSize * 3);
      rotate(PI / 6);
    }
    pop();

    // Lighter petals
    push();
    fill(247, 230, 228, 10);
    translate(flowerX, flowerY);
    for (let i = 1; i <= 16; i++) {
      ellipse(0, flowerSize, flowerSize / 3, flowerSize);
      rotate(PI / 8);
    }
    pop();

    // Darker petals
    push();
    fill(245, 168, 168, 5);
    translate(flowerX, flowerY);
    for (let i = 1; i <= 10; i++) {
      ellipse(0, flowerSize, flowerSize / 3, flowerSize);
      rotate(PI / 4);
    }
    pop();

    // Flower centers
    fill(211, 228, 176, 5);
    circle(flowerX, flowerY, flowerSize / 2);

    fill(209, 124, 124, 50);
    circle(flowerX, flowerY, flowerSize / 4);
  }

  drawFlower(width / 2, height / 2, 100);
}

function mousePressed() {
  background(105, 118, 67);
}
