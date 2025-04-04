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


let drawables = [];
drawables.push(new MouseCircle(100))
drawables.push(new ConstrainedPoint(drawables[0], 100, DistanceConstraint.MAX_DISTANCE));
for (let i = 0; i < 50; i++) {
  drawables.push(new ConstrainedPoint(drawables[0], 100, DistanceConstraint.MIN_DISTANCE));
  drawables.push(new ConstrainedPoint(drawables[0], 100, DistanceConstraint.FIXED_DISTANCE));
}

function mainLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let object of drawables) {
    object.update(mouse_state);
    object.draw();
  }
}
setInterval(mainLoop, (1000 / 60));
