// Distance constraint example, inspired by https://zalo.github.io/blog/constraints/

let environment = new Environment2D("fcmCanvas", new Vector(0, 0), 60);

function generateRandomPointOnCanvas() { return getRandomPositionInRect(environment.canvas.ul, environment.canvas.br); }

let drawables = [];

let mouse_circle = new MouseCircle(Math.min(environment.canvas.width * 0.1, 200));
drawables.push(mouse_circle);

// Add circles outside the mouse-circle that have no intertia and get pushed away by the mouse circle
let out_of_mouse_circle_collection = new ConstrainedPointCollection(1000, mouse_circle, generateRandomPointOnCanvas, environment.canvas.width * 0.005, DistanceConstraint.MIN_DISTANCE, 0.85, 0.85);
drawables.push(out_of_mouse_circle_collection);

let num_clusters = 3;
let fuzziness = 1.5;
let max_interations = 30;
let error_tolerance = 0.001;

registerMouseEventListeners(environment);
registerFloatSlider("numClusters", (value) => { num_clusters = value; }, 0);
registerFloatSlider("fuzziness", (value) => { fuzziness = value; }, 3);
registerFloatSlider("maxIterations", (value) => { max_interations = value; }, 0);
registerFloatSlider("errorTolerance", (value) => { error_tolerance = value; }, 3);

document.getElementById("runAlgorithmButton").addEventListener("click", function () {
  const data = out_of_mouse_circle_collection.points.map((point) => {
    return [point.position.x, point.position.y];
  });

  const clusters = calculateFuzzyCMeans(data, fuzziness, num_clusters, max_interations, error_tolerance);

  out_of_mouse_circle_collection.points.forEach((point, i) => {
    const color = mixColors(colorPalette, clusters.memberships[i]);
    point.fill_color = color;
  })
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
