/**
 * @id eegeduAlphaBetaDraw
 * @title Alpha & Beta Paint Brush (EEGEdu)
 * @category EEGEdu Modules
 * @order 5
 *
 * Original EEGEdu Animate module sketch (sketchDraw.js).
 * Draw a continuous generative painting where Alpha controls X position, Beta controls Y position,
 * and Theta/Delta/Gamma control RGB color. Click canvas to clear.
 */
let brushWidth = 50;

function setup() {
  createCanvas(width, height);
  background(255);
}

function mousePressed() {
  background(255);
}

function draw() {
  let deltaVal = eegData.getChannelBand ? eegData.getChannelBand('delta', 1) : eegData.delta;
  let thetaVal = eegData.getChannelBand ? eegData.getChannelBand('theta', 1) : eegData.theta;
  let alphaVal = eegData.getChannelBand ? eegData.getChannelBand('alpha', 1) : eegData.alpha;
  let betaVal  = eegData.getChannelBand ? eegData.getChannelBand('beta', 1)  : eegData.beta;
  let gammaVal = eegData.getChannelBand ? eegData.getChannelBand('gamma', 1) : eegData.gamma;

  let delta = constrain(Math.floor(deltaVal * 255), 0, 255);
  let theta = constrain(Math.floor(thetaVal * 255), 0, 255);
  let gamma = constrain(Math.floor(gammaVal * 255), 0, 255);

  let xVar = constrain(Math.floor(alphaVal * width), brushWidth / 2, width - brushWidth / 2);
  let yVar = constrain(Math.floor(betaVal * height), brushWidth / 2, height - brushWidth / 2);

  fill(theta, delta, gamma, 28);
  noStroke();
  ellipse(xVar, yVar, brushWidth, brushWidth);
}
