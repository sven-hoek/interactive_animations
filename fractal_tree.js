let environment = new Environment2D("fractalTreeCanvas", new Vector(0, 0.5), 60);

const branch_angle_degrees_min = 1;
const branch_angle_degrees_max = 180;
let branch_angle_degrees = 30;

const branch_length_min = 10;
const branch_length_max = 100;
let branch_length = 100;

let depth = 10;
let shortening_factor = 0.8;

const root = environment.canvas.center.add(new Vector(0, environment.canvas.height * 0.2));

function drawTree() {
  environment.ctx.clearRect(0, 0, environment.canvas.width, environment.canvas.height);
  drawFractalTreeLine(environment.ctx, root, branch_length, branch_angle_degrees * Math.PI / 180, -0.5 * Math.PI, depth, "#888", shortening_factor);
}

drawTree();

// Redraw tree whenever parameters change through mouse/touch movement
registerMouseEventListeners(environment);
["mousemove", "touchmove"].forEach((event_name) => document.addEventListener(event_name, (e) => {
  const rel_x = environment.mouse_state.position.x / environment.canvas.width;
  const rel_y = (environment.canvas.height - environment.mouse_state.position.y) / environment.canvas.height;
  branch_angle_degrees = projectToRange(rel_x, branch_angle_degrees_min, branch_angle_degrees_max, true);
  branch_length = projectToRange(rel_y, branch_length_min, branch_length_max, true);
  drawTree();
}));

// Or when slider values changes
registerFloatSlider("depth", (value) => {
  depth = value;
  drawTree();
}, 0);

registerFloatSlider("shorteningFactor", (value) => {
  shortening_factor = value;
  drawTree();
}, 2);
