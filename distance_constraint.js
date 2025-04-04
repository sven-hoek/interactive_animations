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

  update(mouse_state) {
    this.position = mouse_state.position;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.closePath();
  }
}

class ConstrainedPoint{
  constructor(parent, distance, distance_constraint) {
    this.parent = parent;
    this.distance = distance;
    this.distance_constraint = distance_constraint;
    this.position = getRandomPosition();
  }

  update(mouse_state) {
    this.position = constrainDistance(this.position, this.parent.position, this.distance, this.distance_constraint);
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, 10, 0, Math.PI*2);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
    ctx.closePath();
  }
}

class DistanceConstraintChain {
  constructor(n, link_length) {
    this.link_length = link_length;
    this.points = new Array(n).fill(null).map(() => new Vector(0, 0));
  }

  update(mouse_event) {
    this.points[0] = mouse_event.position;
    for (let i = 1; i < this.points.length; i++) {
      const previous = this.points[i - 1];
      this.points[i] = constrainDistance(this.points[i], previous, this.link_length, DistanceConstraint.FIXED_DISTANCE);
    }
  }

  draw() {
    this.points.forEach((point, i, points) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, Math.PI*2);
      ctx.fillStyle = "#ABCDDD";
      ctx.fill();

      if (i > 0) {
        const previous = points[i - 1];
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = "#000000";
        ctx.stroke();
      }
      ctx.closePath();
    });
  }
}

let drawables = [];
drawables.push(new MouseCircle(100))
drawables.push(new ConstrainedPoint(drawables[0], 100, DistanceConstraint.MAX_DISTANCE));
for (let i = 0; i < 50; i++) {
  drawables.push(new ConstrainedPoint(drawables[0], 100, DistanceConstraint.MIN_DISTANCE));
  drawables.push(new ConstrainedPoint(drawables[0], 100, DistanceConstraint.FIXED_DISTANCE));
}
drawables.push(new DistanceConstraintChain(30, 20));

function mainLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let object of drawables) {
    object.update(mouse_state);
    object.draw();
  }
}
setInterval(mainLoop, (1000 / 60));
