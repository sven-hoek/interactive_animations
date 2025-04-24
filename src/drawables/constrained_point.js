//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A point/circle constrained to the inside/outside/outline of a parent circle (anything with a radius)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class ConstrainedPoint {
  constructor(parent, start_position, radius, constraint_type, weight, dampening_coefficient = 0.99) {
    this.parent = parent;
    this.radius = radius;
    this.constraint_type = constraint_type;
    this.distance_to_parent = constraint_type === DistanceConstraint.MAX_DISTANCE ? parent.radius - radius : constraint_type === DistanceConstraint.MIN_DISTANCE ? parent.radius + radius : parent.radius;
    this.position = start_position;
    this.previous_position = this.position.copy();
    this.weight = weight;
    this.dampening_coefficient = dampening_coefficient;
  }

  constrainToCanvas(canvas) { this.position = this.position.clampToRect(canvas.ul, canvas.br, this.radius); }

  constrainDistanceToParent() { this.position = constrainDistance(this.position, this.parent.position, this.distance_to_parent, this.constraint_type); }

  integratePosition(environment) {
    const velocity = this.position.subtract(this.previous_position).mult(this.dampening_coefficient);
    this.previous_position = this.position.copy();
    this.position = this.position.add(velocity).add(environment.gravity.mult(this.weight));
  }

  update(environment) {
    this.integratePosition(environment);
    this.constrainToCanvas(environment.canvas);
    this.constrainDistanceToParent(environment);
  }

  draw(environment) { drawCircle(environment.ctx, this.position, this.radius, "#111", "#532FAD"); }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A collection of ConstrainedPoints, avoiding overlaps between each other, e.g. colliding with each other
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class ConstrainedPointCollection {
  constructor(n, parent, generateStartPositionFunc, radius, constraint_type, weight) {
    this.points = new Array(n).fill(null).map(() => new ConstrainedPoint(parent, generateStartPositionFunc(), radius, constraint_type, weight));
  }

  separatePoints() {
    this.points.forEach((point, i) => {
      this.points.slice(i + 1).forEach((next_point) => {
        const offset = getSpringForceDisplacement(point.position, next_point.position, point.radius + next_point.radius + 3, SpringConstraint.PUSH)
        point.position = point.position.add(offset.mult(0.5))
        next_point.position = next_point.position.add(offset.mult(-0.5))
      });
    });
  }

  addPoint(point) { this.points.push(point); }

  update(environment) {
    this.points.forEach((point) => { point.integratePosition(environment); });
    this.separatePoints();
    this.points.forEach((point) => {
      point.constrainToCanvas(environment.canvas);
      point.constrainDistanceToParent();
    });
  }

  draw(environment) { this.points.forEach((point) => { point.draw(environment); }); }
}
