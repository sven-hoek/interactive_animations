// Distance constraint example, inspired by https://zalo.github.io/blog/constraints/

let environment = new Environment2D("circlesInCirclesCanvas", new Vector(0, 1), 60);
registerMouseEventListeners(environment);

function generateRandomPointOnCanvas() { return getRandomPositionInRect(environment.canvas.ul, environment.canvas.br); }

let drawables = [];

let mouse_circle = new MouseCircle(Math.min(environment.canvas.width * 0.2, 200));
drawables.push(mouse_circle);

// Add circles outside the mouse-circle that have no intertia and get pushed away by the mouse circle
let out_of_mouse_circle_collection = new ConstrainedPointCollection(1000, mouse_circle, generateRandomPointOnCanvas, 3, DistanceConstraint.MIN_DISTANCE, 0.85);
drawables.push(out_of_mouse_circle_collection);

// Add circles into the mouse circle that are constrained to its inside
let inside_mouse_circle_collection = new ConstrainedPointCollection(2, mouse_circle, generateRandomPointOnCanvas, mouse_circle.radius * 0.4, DistanceConstraint.MAX_DISTANCE, 1.0);
drawables.push(inside_mouse_circle_collection);

// Add circles to each inner circle
inside_mouse_circle_collection.points.forEach((point) => {
  let inner_circle_collection = new ConstrainedPointCollection(3, point, generateRandomPointOnCanvas, point.radius * 0.32, DistanceConstraint.MAX_DISTANCE, 1.0);
  drawables.push(inner_circle_collection);

  // And into these inner inner circles, also add more circles inside
  inner_circle_collection.points.forEach((inner_point) => {
    let inner_inner_circle_collection = new ConstrainedPointCollection(10, inner_point, generateRandomPointOnCanvas, inner_point.radius * 0.11, DistanceConstraint.MAX_DISTANCE, 1.0);
    drawables.push(inner_inner_circle_collection);
  });
});

function mainLoop() {
  if (!environment.mouse_state.position) { return; }

  environment.ctx.clearRect(0, 0, environment.canvas.width, environment.canvas.height);
  for (let object of drawables) {
    object.update(environment);
    object.draw(environment);
  }
}
setInterval(mainLoop, environment.update_interval_ms);
