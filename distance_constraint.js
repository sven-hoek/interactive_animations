// Distance constraint example, inspired by https://zalo.github.io/blog/constraints/



class DistanceConstraintChain {
  constructor(n, link_length, offset) {
    this.offset = offset;
    this.link_length = link_length;
    this.points = new Array(n).fill(null).map(() => new Vector(0, 0));
  }

  update(environment) {
    this.points[0] = environment.mouse_state.position.add(this.offset);
    for (let i = 1; i < this.points.length; i++) {
      const previous = this.points[i - 1];
      // this.points[i] = this.points[i].add(environment.gravity);
      this.points[i] = constrainDistance(this.points[i], previous, this.link_length, DistanceConstraint.FIXED_DISTANCE);
    }
  }

  draw(environment) {
    this.points.forEach((point, i, points) => {
      environment.ctx.beginPath();
      environment.ctx.arc(point.x, point.y, this.link_length, 0, Math.PI*2);
      environment.ctx.strokeStyle = "#FFFFFF";
      environment.ctx.stroke();
      environment.ctx.closePath();

      if (i > 0) {
        const previous = points[i - 1];
        environment.ctx.beginPath();
        environment.ctx.moveTo(previous.x, previous.y);
        environment.ctx.lineTo(point.x, point.y);
        environment.ctx.strokeStyle = "#000000";
        environment.ctx.stroke();
        environment.ctx.closePath();
      }
    });
  }
}

class FABRIKChain {
  constructor(n, link_length) {
    this.link_length = link_length;
    this.points = new Array(n).fill(null).map(() => new Vector(0, 0));
  }

  update(environment) {
    this.points[0] = environment.mouse_state.position;
    for (let i = 1; i < this.points.length; i++) {
      const previous = this.points[i - 1];
      this.points[i] = this.points[i].add(environment.gravity);
      this.points[i] = constrainDistance(this.points[i], previous, this.link_length, DistanceConstraint.FIXED_DISTANCE);
    }

    this.points[this.points.length - 1] = environment.canvas.center.copy();
    for (let i = this.points.length - 1; i > 0; i--) {
      const current = this.points[i];
      this.points[i] = this.points[i].add(environment.gravity);
      this.points[i - 1] = constrainDistance(this.points[i - 1], current, this.link_length, DistanceConstraint.FIXED_DISTANCE);
    }
  }

  draw(environment) {
    this.points.forEach((point, i, points) => {
      environment.ctx.beginPath();
      environment.ctx.arc(point.x, point.y, this.link_length, 0, Math.PI*2);
      environment.ctx.strokeStyle = "#000";
      environment.ctx.stroke();
      environment.ctx.closePath();

      if (i > 0) {
        const previous = points[i - 1];
        environment.ctx.beginPath();
        environment.ctx.moveTo(previous.x, previous.y);
        environment.ctx.lineTo(point.x, point.y);
        environment.ctx.strokeStyle = "#FFF";
        environment.ctx.stroke();
        environment.ctx.closePath();
      }
    });
  }
}

let environment = new Environment2D("myCanvas", new Vector(0, 1), 60);
registerMouseEventListeners(environment);

function generateRandomPointOnCanvas() { return getRandomPositionInRect(environment.canvas.ul, environment.canvas.br); }

let drawables = [];

const mouse_circle_size = 100;
let mouse_circle =new MouseCircle(mouse_circle_size);
drawables.push(mouse_circle);

let mouse_circle_left_chain = new DistanceConstraintChain(100, 5, new Vector(-mouse_circle_size, 0));
drawables.push(mouse_circle_left_chain);
let mouse_circle_right_chain = new DistanceConstraintChain(100, 5, new Vector(mouse_circle_size, 0));
drawables.push(mouse_circle_right_chain);

let fabrik_chain_canvas_center_to_mouse = new FABRIKChain(100, 5);
drawables.push(fabrik_chain_canvas_center_to_mouse);

let point_constrained_in_mouse_circle =  new ConstrainedPoint(mouse_circle, environment.canvas.center, 10, DistanceConstraint.MAX_DISTANCE, 0.8);
drawables.push(point_constrained_in_mouse_circle);

// Add circles outside the mouse-circle that have no intertia and get pushed away by the mouse circle
let out_of_mouse_circle_collection = new ConstrainedPointCollection(100, mouse_circle, generateRandomPointOnCanvas, 10, DistanceConstraint.MIN_DISTANCE, 0.0);
drawables.push(out_of_mouse_circle_collection);

function mainLoop() {
  if (!environment.mouse_state.position) { return; }

  environment.ctx.clearRect(0, 0, environment.canvas.width, environment.canvas.height);
  for (let object of drawables) {
    object.update(environment);
    object.draw(environment);
  }
}
setInterval(mainLoop, environment.update_interval_ms);
