/**
 * @id eegeduFunctionExample
 * @title Custom Function Triplet (Classic EEGEdu)
 * @category Classic p5.eegedu
 * @order 13
 *
 * Original functionExample.p5 sketch by Kyle Mathewson.
 * Demonstrates creating custom drawing functions inside draw() driven by Left and Right Alpha.
 */
function setup() {
  colorMode(RGB, 255);
  background(255, 255, 200);
}

function draw() {
  let MOUSEX = mouseX || width / 2;
  let MOUSEY = mouseY || height / 2;

  let LEFTALPHA  = eegData.getChannelBand('alpha', 1) * 100;
  let RIGHTALPHA = eegData.getChannelBand('alpha', 2) * 100;

  function drawCircle(r, g, b, x, y, d) {
    fill(r, g, b);
    ellipse(x, y, d);
  }

  drawCircle(10, 0, 255, MOUSEX, MOUSEY, RIGHTALPHA);
  drawCircle(10, 255, 10, MOUSEX + 100, MOUSEY, RIGHTALPHA);
  drawCircle(255, 10, 10, MOUSEX - 100, MOUSEY, LEFTALPHA);
}

function mousePressed() {
  background(255, 255, 200);
}
