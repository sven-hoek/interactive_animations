//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Class representing a point with constraints solved with the Jacobi method
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class JacobiPoint {
  constructor(position, dampening_factor, mouse_distance_thresh) {
    this.position = position.copy();
    this.previous_position = position.copy();
    this.accumulated_displacement = new Vector(0, 0);
    this.accumulated_displacement_weight = 0;
    this.dampening_factor = dampening_factor;
    this.mouse_distance_thresh = mouse_distance_thresh;
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

  applyMouseConstraint(mouse_state) {
    if (!mouse_state.isDown) return;
    this.position = constrainDistance(this.position, mouse_state.position, this.mouse_distance_thresh, DistanceConstraint.MIN_DISTANCE);
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
  constructor(center, n_points, radius, puffiness, hull_stretchiness, iterations) {
    this.radius = radius;
    this.area = radius * radius * Math.PI;
    this.puffiness = puffiness;
    this.circumference = radius * Math.PI * 2;
    this.chord_length = this.circumference * hull_stretchiness / n_points;
    this.iterations = iterations;

    this.points = new Array(n_points).fill(null).map((value, i) => {
      const angle = 2 * Math.PI * i / n_points;
      const offset = Vector.fromPolar(this.radius, angle);
      return new JacobiPoint(center.add(offset), 0.99, this.radius * 0.8);
    });
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

  applyMouseConstraint(mouse_state) {
    const closest_point = this.points.reduce((closest, curr) => {
      const dist = curr.position.getDistance(mouse_state.position);
      if (!closest || dist < closest.distance) {
        return { point: curr, distance: dist };
      }
      return closest;
    }, null)

    closest_point.point.applyMouseConstraint(mouse_state);
  }

  update(environment) {
    this.points.forEach((point) => point.integrateDynamics(environment));
    for (let i = 0; i < this.iterations; ++i) {
      this.applyDistanceConstraints(this.chord_length);
      this.applyAreaConstraint(this.puffiness);
      this.points.forEach((point) => point.applyDisplacements());
      this.points.forEach((point) => {
        point.constrainToCanvas(environment.canvas);
        point.applyMouseConstraint(environment.mouse_state);
      });
    }

  }

  draw(environment) {
    drawSmoothPath(environment.ctx, this.points.map((point) => point.position), "#111", 1, true, "#222");
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

let environment = new Environment2D("softBodyCanvas", new Vector(0, 0.5), 60);
let drawables = [];
let blob = new SoftBody(environment.canvas.center, 20, 50, 1.1, 1.2, 10);
drawables.push(blob);

registerMouseEventListeners(environment);
function mainLoop() {
  if (!environment.mouse_state.position) { return; }

  environment.ctx.clearRect(0, 0, environment.canvas.width, environment.canvas.height);
  for (let object of drawables) {
    object.update(environment);
    object.draw(environment);
  }
}
setInterval(mainLoop, environment.update_interval_ms);
