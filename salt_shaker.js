// Distance constraint example, inspired by https://zalo.github.io/blog/constraints/

const gravity = new Vector(0, 1);

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

  update(mouse_state) {
    this.position = mouse_state.position;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
    ctx.fillStyle = "#222";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
  }
}

class ConstrainedPoint{
  constructor(parent, radius) {
    this.parent = parent;
    this.radius = radius;
    this.position = getRandomPosition();
    this.previous_position = this.position.copy();
  }

  constrainDistanceToParent() {
    this.position = constrainDistance(this.position, this.parent.position, this.parent.radius - this.radius, DistanceConstraint.MAX_DISTANCE);
  }

  integratePosition() {
    const velocity = this.position.subtract(this.previous_position);
    this.previous_position = this.position.copy();
    this.position = this.position.add(velocity.add(gravity));
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
    ctx.fillStyle = "#310091";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.stroke();
    ctx.closePath();
  }
}

class ConstrainedPointCollection {
  constructor(parent, radius, n) {
    this.points = new Array(n).fill(null).map(() => new ConstrainedPoint(parent, radius));
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

  update(mouse_state) {
    this.points.forEach((point) => { point.integratePosition(); });
    this.separatePoints();
    this.points.forEach((point) => { point.constrainDistanceToParent(); });
  }

  draw() { this.points.forEach((point) => { point.draw(); }); }
}


let drawables = [];
const mouse_circle_size = 250;
let big_circle =new MouseCircle(mouse_circle_size);
drawables.push(big_circle);
let big_circle_collection = new ConstrainedPointCollection(big_circle, 80, 3);
drawables.push(big_circle_collection);

big_circle_collection.points.forEach((point) => {
  let inner_circle_collection = new ConstrainedPointCollection(point, 7, 30);
  drawables.push(inner_circle_collection);
});


function mainLoop() {
  big_circle.update(mouse_state);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let object of drawables) {
    object.update(mouse_state);
    object.draw();
  }
}
setInterval(mainLoop, (1000 / 60));
