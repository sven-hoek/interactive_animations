// Distance constraint example, inspired by https://zalo.github.io/blog/constraints/

const DistanceConstraint = Object.freeze({
  MIN_DISTANCE: 0,
  MAX_DISTANCE: 1,
  FIXED_DISTANCE: 2,
});

function constrainDistance(point, anchor, distance, distance_constraint) {
  const diff = anchor.subtract(point);
  const distance_to_anchor = diff.getMagnitude();
  if ( distance_constraint === DistanceConstraint.FIXED_DISTANCE ||
      (distance_constraint === DistanceConstraint.MIN_DISTANCE && distance_to_anchor < distance) ||
      (distance_constraint === DistanceConstraint.MAX_DISTANCE && distance_to_anchor > distance)) {
    return point.add(diff.getWithMagnitude(distance_to_anchor - distance));
  }
  else { return point; }
}

class MouseCircle {
  constructor(radius) {
    this.radius = radius;
    this.position = new Vector(0, 0);
  }

  update(environment) {
    this.position = environment.mouse_state.position;
  }

  draw(environment) {
    environment.ctx.beginPath();
    environment.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
    environment.ctx.fillStyle = "#222";
    environment.ctx.fill();
    environment.ctx.strokeStyle = "#000";
    environment.ctx.lineWidth = 2;
    environment.ctx.stroke();
    environment.ctx.closePath();
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A point/circle constrained to the inside/outside/outline of a parent circle (anything with a radius)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class ConstrainedPoint{
  constructor(parent, position, radius, constraint_type, weight) {
    this.parent = parent;
    this.radius = radius;
    this.constraint_type = constraint_type;
    this.distance_to_parent = constraint_type === DistanceConstraint.MAX_DISTANCE ? parent.radius - radius : constraint_type === DistanceConstraint.MIN_DISTANCE ? parent.radius + radius : parent.radius;
    this.position = position;
    this.previous_position = this.position.copy();
    this.weight = weight;
  }

  constrainDistanceToParent() {
    this.position = constrainDistance(this.position, this.parent.position, this.distance_to_parent, this.constraint_type);
  }

  integratePosition(environment) {
    const velocity = this.position.subtract(this.previous_position).mult(this.weight);
    this.previous_position = this.position.copy();
    this.position = this.position.add(velocity.add(environment.gravity.mult(this.weight)));
  }

  draw(environment) {
    environment.ctx.beginPath();
    environment.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
    environment.ctx.fillStyle = "#310091";
    environment.ctx.fill();
    environment.ctx.strokeStyle = "#000";
    environment.ctx.stroke();
    environment.ctx.closePath();
  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A collection of ConstrainedPoints, avoiding overlaps between each other, e.g. colliding with each other
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class ConstrainedPointCollection {
  constructor(n, parent, generatePositionFunc, radius, constraint_type, weight) {
    this.points = new Array(n).fill(null).map(() => new ConstrainedPoint(parent, generatePositionFunc(), radius, constraint_type, weight));
  }

  separatePoints() {
    this.points.forEach((point, i) => {
      this.points.slice(i + 1).forEach((next_point) => {
        const to_next = next_point.position.subtract(point.position);
        const distance = to_next.getMagnitude();
        const min_distance = point.radius + next_point.radius + 3;
        if (distance < min_distance) {
          const offset = to_next.getWithMagnitude(min_distance - distance);
          point.position = point.position.add(offset.mult(-0.5));
          next_point.position = next_point.position.add(offset.mult(0.5));
        }
      });
    });
  }

  addPoint(point) { this.points.push(point); }

  update(environment) {
    this.points.forEach((point) => { point.integratePosition(environment); });
    this.separatePoints();
    this.points.forEach((point) => { point.constrainDistanceToParent(); });
  }

  draw(environment) { this.points.forEach((point) => { point.draw(environment); }); }
}

var environment = new Environment2D("myCanvas", new Vector(0, 1));
registerMouseEventListeners(environment);

function generateRandomPointOnCanvas() { return getRandomPositionInRect(environment.canvas.ul, environment.canvas.br); }

let drawables = [];
const mouse_circle_size = 300;
let big_circle =new MouseCircle(mouse_circle_size);
drawables.push(big_circle);
let out_of_big_circle_collection = new ConstrainedPointCollection(1000, big_circle, generateRandomPointOnCanvas, 3, DistanceConstraint.MIN_DISTANCE, 0.0);
drawables.push(out_of_big_circle_collection);
let big_circle_collection = new ConstrainedPointCollection(2, big_circle, generateRandomPointOnCanvas, 140, DistanceConstraint.MAX_DISTANCE, 1.0);
drawables.push(big_circle_collection);

big_circle_collection.points.forEach((point) => {
  let inner_circle_collection = new ConstrainedPointCollection(3, point, generateRandomPointOnCanvas, 45, DistanceConstraint.MAX_DISTANCE, 1.0);
  drawables.push(inner_circle_collection);
  inner_circle_collection.points.forEach((inner_point) => {
    let inner_inner_circle_collection = new ConstrainedPointCollection(20, inner_point, generateRandomPointOnCanvas, 5, DistanceConstraint.MAX_DISTANCE, 1.0);
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
setInterval(mainLoop, (1000 / 60));
