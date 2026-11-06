/**
 * @id studentVillaflorTerrain3D
 * @title 3D Perlin Terrain (Lance Villaflor)
 * @category 2022 NeuroArt Class Gallery
 * @order 26
 *
 * Student NeuroArt Project by Lance Villaflor (PSYCO 403 Final Project).
 * 3D WEBGL Perlin-noise terrain flyover whose horizon depth is modulated by Delta EEG activity.
 */
let cols = 70;
let rows = 35;
let scl = 20;
let w = 1400;
let h = 700;
let color_Codes = ["#4f5bdb", "#66cdaa", "#00a4b2", "#be149a"];
let flying = 0;
let terrain = [];

function setup() {
  createCanvas(width, height, WEBGL);
  cols = w / scl;
  rows = h / scl;
  terrain = [];
  for (let x = 0; x < cols; x++) {
    terrain[x] = [];
    for (let y = 0; y < rows; y++) {
      terrain[x][y] = 0;
    }
  }
}

function draw() {
  let DELTA = constrain(floor(8 + eegData.getChannelBand('delta', 0) * (rows - 8)), 6, rows);

  flying -= 0.1;
  let yoff = flying;
  for (let y = 0; y < DELTA; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      terrain[x][y] = map(noise(xoff, yoff), 0, 1, -100, 100);
      xoff += 0.2;
    }
    yoff += 0.2;
  }

  background("black");
  translate(0, 50);
  rotateX(PI / 3);
  let random_Color = floor(random(color_Codes.length));
  fill(color_Codes[random_Color]);
  stroke(20);

  translate(-w / 2, -h / 2);
  for (let y = 0; y < DELTA - 1; y++) {
    beginShape(TRIANGLE_STRIP);
    for (let x = 0; x < cols; x++) {
      vertex(x * scl, y * scl, terrain[x][y]);
      vertex(x * scl, (y + 1) * scl, terrain[x][y + 1]);
    }
    endShape();
  }
}
