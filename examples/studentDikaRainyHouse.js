/**
 * @id studentDikaRainyHouse
 * @title Rainy House (Kirsten Dika)
 * @category 2022 NeuroArt Class Gallery
 * @order 6
 *
 * Student NeuroArt Project by Kirsten Dika.
 * Raindrops fall at a speed controlled by Theta waves while the house windows glow with Alpha power.
 */
let lineY = [];

function setup() {
  colorMode(RGB, 255);
  lineY = [];
  for (let i = 0; i < 100; i++) {
    lineY[i] = random(height);
  }
}

function draw() {
  let alpha  = eegData.getChannelBand('alpha', 0) * 2.5;
  let alpha2 = eegData.getChannelBand('alpha', 2) * 2.5;
  let alpha3 = eegData.getChannelBand('alpha', 3) * 2.5;
  let theta  = eegData.getChannelBand('theta', 3) * 12;

  background(32, 42, 68);

  push();
  scale(width / 300, height / 300);

  // Hills
  noStroke();
  fill(118, 136, 106);
  circle(90, 330, 200);
  circle(220, 370, 200);

  // House
  drawHouse(
    230, 195, 100, 100,
    [84, 7, 7],
    [0, 0, 0],
    [alpha * 100, alpha2 * 100, alpha3 * 100],
    [214, 183, 152]
  );
  pop();

  // Rain
  for (let i = 0; i < lineY.length; i++) {
    let lineX = (width * i) / lineY.length;
    stroke(187, 205, 212);
    strokeWeight(2);
    line(lineX, lineY[i], lineX, lineY[i] + 8);

    lineY[i] += random(1, max(2, theta));
    if (lineY[i] > height) {
      lineY[i] = 0;
    }
  }
}

function drawHouse(squareX, squareY, wide, high, color1, color2, color3, color4) {
  let houseDistance = wide / 2;

  // Main square of house
  fill(color1);
  rect(squareX - houseDistance, squareY - houseDistance, wide, high);

  // Roof
  fill(color2);
  triangle(squareX - wide / 2, squareY - high / 2, squareX, squareY - high, squareX + houseDistance, squareY - high / 2);

  // Chimney
  fill(color1);
  rect(squareX + high / 10, squareY - high, houseDistance / 3, high / 3);

  // Windows
  fill(color3);
  rect(squareX + high / 10, squareY - high / 3, houseDistance / 2, high / 4);
  rect(squareX - high / 3, squareY - high / 3, houseDistance / 2, high / 4);

  // Door
  fill(color4);
  rect(squareX - high / 9, squareY + high / 6, houseDistance / 2, high / 3);

  // Doorknob
  fill(color1);
  circle(squareX + high / 10, squareY + high / 3, wide / 25);
}
