// Distance constraint example, inspired by https://zalo.github.io/blog/constraints/

let environment = new Environment2D("ropeCanvas", new Vector(0, 1), 60);
registerMouseEventListeners(environment);

function generateRandomPointOnCanvas() { return getRandomPositionInRect(environment.canvas.ul, environment.canvas.br); }

let drawables = [];
let obstacles = [];

const mouse_circle_size = environment.canvas.width * 0.005;
let mouse_circle = new MouseCircle(mouse_circle_size);
drawables.push(mouse_circle);

let obstacle_circle_collection = new ConstrainedPointCollection(10, mouse_circle, generateRandomPointOnCanvas, mouse_circle.radius * 20, DistanceConstraint.MIN_DISTANCE, 0.85);
drawables.push(obstacle_circle_collection);
obstacles.push(...obstacle_circle_collection.points);

let rope = new Rope(mouse_circle, new Vector(0, 0), 50, mouse_circle.radius * 2, 0.8, 1.5, obstacles);
drawables.push(rope);

function mainLoop() {
  if (!environment.mouse_state.position) { return; }

  environment.ctx.clearRect(0, 0, environment.canvas.width, environment.canvas.height);
  for (let object of drawables) {
    object.update(environment);
    object.draw(environment);
  }
}
setInterval(mainLoop, environment.update_interval_ms);
