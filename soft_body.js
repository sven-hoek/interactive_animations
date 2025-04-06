//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Class representing a point of an elastic blob
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class SoftBodyPoint {
  constructor(position, speed, radius, dampening_factor, lifetime) {
    this.position = new Vector(position.x, position.y);
    this.previous_position = position.subtract(speed);
    this.displacement = new Vector(0, 0);
    this.displacement_weight = 0;
    this.radius =  radius
    this.dampening_factor = dampening_factor;
    this.lifetime = lifetime;
    drawables.push(this)

    console.log("Creating SoftBodyPoint", this)
  }

  draw(environment) {
    environment.ctx.beginPath();
    environment.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
    environment.ctx.fillStyle = "#0095DD";
    environment.ctx.fill();
    environment.ctx.closePath();
  }

  getVelocity() { return this.position.subtract(this.previous_position); }

  restrictPositionToCanvas(canvas) { this.position = this.position.clampToRect(canvas.ul, canvas.br); }

  integrateKinematics(gravity) {
    const velocity = this.getVelocity().add(gravity);
    const dampened_velocity = velocity.mult(this.dampening_factor);
    const new_position = this.position.add(dampened_velocity);

    this.previous_position = this.position
    this.position = new_position;
  }

  updateLifetime() {
    if (this.lifetime > 0) {
      this.lifetime--;
    }
  }

  applyMouseConstraint(mouse_state) {
    if (!mouse_state.isDown) return;

    const diff = mouse_state.position.subtract(this.position);
    const distance = diff.getMagnitude();
    if (distance < 25) {
      this.position = this.position.add(diff.getWithMagnitude(distance * 0.4));
    }
  }

  accumulateDisplacement(v) {
    this.displacement = this.displacement.add(v);
    this.displacement_weight += 1;
  }

  applyDisplacement() {
    if (this.displacement_weight > 0) {
      this.position = this.position.add(this.displacement.mult(1 / this.displacement_weight));
      this.displacement = new Vector(0, 0);
      this.displacement_weight = 0;
    }
  }

  update(environment) {
    this.applyDisplacement();
    this.applyMouseConstraint(environment.mouse_state);
    this.restrictPositionToCanvas(environment.canvas);
    this.integrateKinematics(environment.gravity);
    this.updateLifetime();
  }
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Class representing an elastic body
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class SoftBody {
  constructor(origin, n_points, radius, puffiness, iterations) {
    this.radius = radius;
    this.area = radius * radius * Math.PI * puffiness;
    this.circumference = radius * Math.PI * 2;
    this.chord_length = this.circumference / n_points;
    this.iterations = iterations;
    this.points = new Array(n_points).fill(null).map((value, i) => {
      const angle = 2 * Math.PI * i / n_points - Math.PI / 2;
      const offset = new Vector(Math.cos(angle) * radius, Math.sin(angle) * radius);
      return new SoftBodyPoint(origin.add(offset), new Vector(5, 0), 3, 0.99, 2400);
    });
    this.lifetime = -1;
    drawables.push(this);
  }

  applyDistanceConstraints() {
    for (let i = 0; i < this.iterations; ++i) {
      this.points.forEach((cur, i, points) => {
        const next  = points[i == points.length - 1 ? 0 : i + 1];

        const diff = next.position.subtract(cur.position);
        if (diff.getMagnitude() != this.chord_length) {
          const error = (diff.getMagnitude() - this.chord_length) / 2;
          const offset = diff.getWithMagnitude(error);
          cur.accumulateDisplacement(offset);
          next.accumulateDisplacement(offset.mult(-1));
        }
      });
    }
  }

  applyAreaConstraint() {
    const area_error = this.area - this.getArea();
    const offset = area_error / this.circumference;

    this.points.forEach((cur, i, points) => {
      const prev = points[i == 0 ? points.length - 1 : i - 1];
      const next  = points[i == points.length - 1 ? 0 : i + 1];
      const secant = next.position.subtract(prev.position);
      const normal = secant.rotate(-Math.PI / 2).getWithMagnitude(offset);
      cur.accumulateDisplacement(normal);
    })
  }

  applyAngleConstraints(min_angle) {
    this.points.forEach((cur, i, points) => {
      let prev = points[i == 0 ? points.length - 1 : i - 1];
      let next  = points[i == points.length - 1 ? 0 : i + 1];

      const prev_vec = prev.position.subtract(cur.position);
      const next_vec = next.position.subtract(cur.position);
      const angle = prev_vec.getAngle(next_vec);

      const angle_diff = min_angle - angle;
      if (angle_diff > 0) {
        const prev_offset = prev_vec.rotate(angle_diff / 2).subtract(prev_vec);
        const next_offset = next_vec.rotate(-angle_diff / 2).subtract(next_vec);
        prev.accumulateDisplacement(prev_offset);
        next.accumulateDisplacement(next_offset);
      }
    })
  }

  update(environment) {
    this.applyDistanceConstraints();
    this.applyAreaConstraint();
    // this.applyAngleConstraints(Math.PI / 0.8);
  }

  draw(environment) {}

  getArea() {
    return this.points.reduce((area, cur, i, points) => {
      let next  = points[i == points.length - 1 ? 0 : i + 1];
      return area + (cur.position.x - next.position.x) * ((cur.position.y + next.position.y) / 2);
    }, 0)
  }

  toString() {
    this.points.map((value) => value.position).join(", ")
  }
}

let environment = new Environment2D("myCanvas", new Vector(0, 1), 60);
let drawables = [];

// let blob_point = new SoftBodyPoint(canvas_center, new Vector(5, 0), 10, 0.99, -1);
let blob = new SoftBody(environment.canvas.center, 19, 50, 1.2, 5);

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
