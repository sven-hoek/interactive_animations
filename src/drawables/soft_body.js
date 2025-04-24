//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Class representing a point with constraints solved with the Jacobi method
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class JacobiPoint {
  constructor(position, dampening_factor) {
    this.position = position.copy();
    this.previous_position = position.copy();
    this.accumulated_displacement = new Vector(0, 0);
    this.accumulated_displacement_weight = 0;
    this.dampening_factor = dampening_factor;
  }

  getVelocity() { return this.position.subtract(this.previous_position); }

  constrainToCanvas(canvas) { this.position = this.position.clampToRect(canvas.ul, canvas.br); }

  integrateDynamics(environment) {
    const velocity = this.getVelocity().add(environment.gravity);
    const dampened_velocity = velocity.mult(this.dampening_factor);
    const new_position = this.position.add(dampened_velocity);

    this.previous_position = this.position
    this.position = new_position;
  }

  applyMouseConstraint(mouse_state, mouse_distance_thresh) {
    if (!mouse_state.isDown) return;
    this.position = constrainDistance(this.position, mouse_state.position, mouse_distance_thresh, DistanceConstraint.MIN_DISTANCE);
  }

  addDisplacement(v) {
    this.accumulated_displacement = this.accumulated_displacement.add(v);
    this.accumulated_displacement_weight += 1;
  }

  applyDisplacements() {
    if (this.accumulated_displacement_weight > 0) {
      const displacement = this.accumulated_displacement.mult(1 / this.accumulated_displacement_weight);
      this.position = this.position.add(displacement);
      this.accumulated_displacement = new Vector(0, 0);
      this.accumulated_displacement_weight = 0;
    }
  }

  update(environment) {
    this.applyDisplacements();
    this.constrainToCanvas(environment.canvas);
    this.applyMouseConstraint(environment.mouse_state)
    this.integrateDynamics(environment);
  }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Class representing an elastic, volume preserving blob
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class SoftBody {
  constructor(center, n_points, radius, puffiness, hull_stretchiness, iterations, obstacles = null) {
    this.n_points = n_points;
    this.puffiness = puffiness;
    this.hull_stretchiness = hull_stretchiness
    this.iterations = iterations;
    this.obstacles = obstacles;
    this.setRadius(radius);

    this.points = new Array(n_points).fill(null).map((value, i) => {
      const angle = 2 * Math.PI * i / n_points;
      const offset = Vector.fromPolar(this.radius, angle);
      return new JacobiPoint(center.add(offset), 0.99);
    });
  }

  setRadius(radius) {
    this.radius = radius;
    this.area = radius * radius * Math.PI;
    this.circumference = radius * Math.PI * 2;
    this.chord_length = this.circumference / this.n_points;
  }

  applyDistanceConstraints(chord_length) {
    this.points.forEach((cur, i, points) => {
      const next = points[wrapIndex(i + 1, points.length)];

      const diff = next.position.subtract(cur.position);
      if (diff.getMagnitude() > chord_length) {
        const error = diff.getMagnitude() - chord_length;
        const offset = diff.getWithMagnitude(error);
        cur.addDisplacement(offset.mult(0.5));
        next.addDisplacement(offset.mult(-0.5));
      }
    });
  }

  applyAreaConstraint(puffiness) {
    const current_area = this.getArea();
    const desired_area = this.area * puffiness;

    const area_error = desired_area - current_area;
    const offset = area_error / this.circumference;

    if (current_area > desired_area * 2) { return; }

    this.points.forEach((cur, i, points) => {
      const prev = points[wrapIndex(i - 1, points.length)];
      const next = points[wrapIndex(i + 1, points.length)];
      const secant = next.position.subtract(prev.position);
      const normal = secant.rotate(-Math.PI / 2).getWithMagnitude(offset);
      cur.addDisplacement(normal);
    })
  }

  collideWithObstacles() {
    if (!this.obstacles) { return; }

    this.points.forEach((point) => {
      this.obstacles.forEach((obstacle) => {
        const offset = getSpringForceDisplacement(point.position, obstacle.position, obstacle.radius, SpringConstraint.PUSH);
        point.addDisplacement(offset.mult(0.85));
        obstacle.position = obstacle.position.add(offset.mult(-0.15));
      })
    })
  }

  applyAngleConstraints(min_angle) {
    this.points.forEach((cur, i, points) => {
      let prev = points[wrapIndex(i - 1, points.length)];
      let next = points[wrapIndex(i + 1, points.length)];

      const prev_vec = prev.position.subtract(cur.position);
      const next_vec = next.position.subtract(cur.position);
      const angle = prev_vec.getAngle(next_vec);

      const angle_diff = min_angle - angle;
      if (angle_diff > 0) {
        const prev_offset = prev_vec.rotate(angle_diff / 2).subtract(prev_vec);
        const next_offset = next_vec.rotate(-angle_diff / 2).subtract(next_vec);
        prev.addDisplacement(prev_offset);
        next.addDisplacement(next_offset);
      }
    })
  }

  update(environment) {
    this.points.forEach((point) => point.integrateDynamics(environment));
    for (let i = 0; i < this.iterations; ++i) {
      this.applyDistanceConstraints(this.chord_length * this.hull_stretchiness);
      this.applyAreaConstraint(this.puffiness);
      this.collideWithObstacles();
      this.points.forEach((point) => point.applyDisplacements());
      this.points.forEach((point) => {
        point.constrainToCanvas(environment.canvas);
        point.applyMouseConstraint(environment.mouse_state, this.radius * 0.8);
      });
    }

  }

  draw(environment) {
    drawSmoothPath(environment.ctx, this.points.map((point) => point.position), "#334", 1, true, "#334");
  }

  getArea() {
    return this.points.reduce((area, cur, i, points) => {
      let next = points[i == points.length - 1 ? 0 : i + 1];
      return area + (cur.position.x - next.position.x) * ((cur.position.y + next.position.y) / 2);
    }, 0)
  }

  toString() {
    this.points.map((value) => value.position).join(", ")
  }
}