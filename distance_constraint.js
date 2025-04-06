// Distance constraint example, inspired by https://zalo.github.io/blog/constraints/

let environment = new Environment2D("myCanvas", new Vector(0, 1), 60);
registerMouseEventListeners(environment);

function generateRandomPointOnCanvas() { return getRandomPositionInRect(environment.canvas.ul, environment.canvas.br); }

let drawables = [];

const mouse_circle_size = 100;
let mouse_circle =new MouseCircle(mouse_circle_size);
drawables.push(mouse_circle);

let mouse_circle_left_chain = new SingleAnchorChain(mouse_circle, new Vector(-mouse_circle_size, 0), 100, 5, 0.1);
drawables.push(mouse_circle_left_chain);
let mouse_circle_right_chain = new SingleAnchorChain(mouse_circle, new Vector(mouse_circle_size, 0), 100, 5, 0.1);
drawables.push(mouse_circle_right_chain);

let fabrik_chain_canvas_center_to_mouse = new FABRIKChain(mouse_circle, new Vector(0, 0), environment.canvas.center, 100, 5, 2);
drawables.push(fabrik_chain_canvas_center_to_mouse);

let point_constrained_in_mouse_circle =  new ConstrainedPoint(mouse_circle, environment.canvas.center, 10, DistanceConstraint.MAX_DISTANCE, 0.8);
drawables.push(point_constrained_in_mouse_circle);

// Add circles outside the mouse-circle that have no intertia and get pushed away by the mouse circle
let out_of_mouse_circle_collection = new ConstrainedPointCollection(100, mouse_circle, generateRandomPointOnCanvas, 10, DistanceConstraint.MIN_DISTANCE, 0.0);
drawables.push(out_of_mouse_circle_collection);

function mainLoop() {
  if (!environment.mouse_state.position) { return; }

  environment.ctx.clearRect(0, 0, environment.canvas.width, environment.canvas.height);
  for (let object of drawables) {
    object.update(environment);
    object.draw(environment);
  }
}
setInterval(mainLoop, environment.update_interval_ms);
