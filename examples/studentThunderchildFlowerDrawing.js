/**
 * @id studentThunderchildFlowerDrawing
 * @title Orange Flower Brush (Thunderchild)
 * @category 2022 NeuroArt Class Gallery
 * @order 25
 *
 * Student NeuroArt Project by Thunderchild.
 * Paints multi-petal orange and red flowers across the canvas sized by Left and Right Alpha waves.
 */
function setup() {
  colorMode(RGB, 255);
  background(255, 255, 200);
}

function draw() {
  let MOUSEX = mouseX || width / 2;
  let MOUSEY = mouseY || height / 2;

  let LEFTALPHA  = eegData.getChannelBand('alpha', 1) * 1.5;
  let RIGHTALPHA = eegData.getChannelBand('alpha', 2) * 1.5;

  function drawCircle(r, g, b, x, y, d) {
    stroke(0);
    fill(r, g, b);
    ellipse(x, y, d);
  }

  drawCircle(255, 0, 0, MOUSEX, MOUSEY, RIGHTALPHA * 50);
  drawCircle(255, 128, 0, MOUSEX / 1.25, MOUSEY / 1.25, RIGHTALPHA * 35);
  drawCircle(255, 128, 0, MOUSEX + 95, MOUSEY - 20, LEFTALPHA * 35);
  drawCircle(255, 128, 0, MOUSEX + 40, MOUSEY + 40, LEFTALPHA * 35);
  drawCircle(255, 128, 0, MOUSEX - 30, MOUSEY + 50, RIGHTALPHA * 35);
  drawCircle(255, 128, 0, MOUSEX + 35, MOUSEY - 35, LEFTALPHA * 35);
}

function mousePressed() {
  background(255, 255, 200);
}
