let environment = new Environment2D("softBodyCanvas", new Vector(0, 0.5), 60);
let drawables = [];
let obstacles = [];

function generateRandomPointOnBottomHalfOfCanvas() { return getRandomPositionInRect(new Vector(0, environment.canvas.center.y), environment.canvas.br); }

let phantom_circle = { position: new Vector(-100, -100), radius: 0 };
let obstacle_circle_collection = new ConstrainedPointCollection(4, phantom_circle, generateRandomPointOnBottomHalfOfCanvas, environment.canvas.width * 0.21, DistanceConstraint.MIN_DISTANCE, 0.85);
drawables.push(obstacle_circle_collection);
obstacles.push(...obstacle_circle_collection.points);

let blob = new SoftBody(new Vector(environment.canvas.center.x, 100), 20, environment.canvas.width * 0.15, 1.6, 1.4, 10, obstacles);
drawables.push(blob);

registerMouseEventListeners(environment);

registerFloatSlider("size", (value) => { blob.setRadius(value * environment.canvas.width); }, 1);
registerFloatSlider("puffiness", (value) => { blob.puffiness = value; }, 1);
registerFloatSlider("elasticity", (value) => { blob.hull_stretchiness = value; }, 1);

function mainLoop() {
  if (!environment.mouse_state.position) { return; }

  environment.ctx.clearRect(0, 0, environment.canvas.width, environment.canvas.height);
  for (let object of drawables) {
    object.update(environment);
    object.draw(environment);
  }
}
setInterval(mainLoop, environment.update_interval_ms);
