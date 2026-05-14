/**
 * @id AlphaSnake
 * @title Alpha Snake
 * @category 3D & Advanced
 * @order 15
 *
 * Auto-split from index.html.
 */
// Alpha snake - snake controlled by alpha waves
let snake = [];
let angle = 0;

function setup() {
  colorMode(HSB, 360, 100, 100);
  
  // Initialize snake
  for (let i = 0; i < 50; i++) {
    snake.push({x: width/2, y: height/2});
  }
}

function draw() {
  background(0, 0, 5, 0.1);
  
  // Move snake head based on alpha
  angle += map(eegData.alpha, 0, 1, -0.1, 0.1);
  let speed = 2 + eegData.beta * 3;
  
  let headX = snake[0].x + cos(angle) * speed;
  let headY = snake[0].y + sin(angle) * speed;
  
  // Wrap around
  headX = (headX + width) % width;
  headY = (headY + height) % height;
  
  // Add new head
  snake.unshift({x: headX, y: headY});
  snake.pop();
  
  // Draw snake
  for (let i = 0; i < snake.length; i++) {
    let hue = (i * 5 + frameCount) % 360;
    let size = map(i, 0, snake.length - 1, 20, 5);
    let brightness = 50 + eegData.attention * 40;
    
    fill(hue, 70, brightness);
    noStroke();
    ellipse(snake[i].x, snake[i].y, size);
  }
}
