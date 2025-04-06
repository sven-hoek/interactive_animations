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

    update(environment) {
      this.integratePosition(environment);
      this.constrainDistanceToParent(environment);
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
