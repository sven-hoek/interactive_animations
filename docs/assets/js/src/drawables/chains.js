class SingleAnchorChain {
  constructor(parent, offset, n, link_length, weight) {
    this.parent = parent;
    this.offset = offset;
    this.link_length = link_length;
    this.weight = weight;
    this.points = new Array(n).fill(null).map(() => new Vector(0, 0));
  }

  update(environment) {
    this.points[0] = this.parent.position.add(this.offset);
    for (let i = 1; i < this.points.length; i++) {
      const previous = this.points[i - 1];
      this.points[i] = this.points[i].add(environment.gravity.mult(this.weight));
      this.points[i] = constrainDistance(this.points[i], previous, this.link_length, DistanceConstraint.FIXED_DISTANCE);
    }
  }

  draw(environment) {
    this.points.forEach((point, i, points) => {
      drawCircle(environment.ctx, point, this.link_length, "#CCC");

      if (i > 0) {
        const previous = points[i - 1];
        drawLine(environment.ctx, previous, point, "#CCC", 1);
      }
    });
  }
}

class FABRIKChain {
  constructor(parent, offset, anchor_point, n, link_length, weight) {
    this.parent = parent;
    this.offset = offset;
    this.anchor_point = anchor_point;
    this.link_length = link_length;
    this.weight = weight;
    this.points = new Array(n).fill(null).map(() => new Vector(0, 0));
  }

  update(environment) {
    this.points[0] = this.parent.position.add(this.offset);
    for (let i = 1; i < this.points.length; i++) {
      const previous = this.points[i - 1];
      this.points[i] = this.points[i].add(environment.gravity.mult(this.weight));
      this.points[i] = constrainDistance(this.points[i], previous, this.link_length, DistanceConstraint.FIXED_DISTANCE);
    }

    this.points[this.points.length - 1] = this.anchor_point;
    for (let i = this.points.length - 1; i > 0; i--) {
      const current = this.points[i];
      this.points[i] = this.points[i].add(environment.gravity.mult(this.weight));
      this.points[i - 1] = constrainDistance(this.points[i - 1], current, this.link_length, DistanceConstraint.FIXED_DISTANCE);
    }
  }

  draw(environment) {
    this.points.forEach((point, i, points) => {
      drawCircle(environment.ctx, point, this.link_length, "#333");

      if (i > 0) {
        const previous = points[i - 1];
        drawLine(environment.ctx, previous, point, "#CCC", 1);
      }
    });
  }
}
class Rope {
  constructor(parent, offset, n, link_length, weight, stretchiness = 1.0, obstacles = null) {
    this.parent = parent;
    this.offset = offset;
    this.link_length = link_length;
    this.weight = weight;
    this.obstacles = obstacles;
    this.stretchiness = stretchiness;
    this.points = new Array(n).fill(null).map(() => { return { current: new Vector(0, 0), previous: new Vector(0, 0) } });
  }

  integratePosition(environment) {
    this.points = this.points.map((point) => {
      const velocity = point.current.subtract(point.previous);
      const gravity = environment.gravity.mult(this.weight);
      return {
        current: point.current.add(velocity).add(gravity),
        previous: point.current,
      };
    })
  }

  applySpringConstraint(iterations, environment) {
    for (let i = 0; i < iterations; ++i) {

      for (let j = 0; j < this.points.length - 1; j++) {
        const point = this.points[j].current;
        const next = this.points[j + 1].current;
        const offset = getSpringForceDisplacement(point, next, this.link_length, SpringConstraint.PULL);

        this.points[j].current = point.add(offset.mult(0.5));
        this.points[j + 1].current = next.add(offset.mult(-0.5));

        if (j == 0) { this.points[0].current = this.parent.position.add(this.offset); }

        const max_distance_from_parent = this.link_length * (j + 1) * this.stretchiness;
        const to_parent = this.parent.position.subtract(this.points[j + 1].current);
        if (to_parent.getMagnitude() > max_distance_from_parent) {
          this.points[j + 1].current = constrainDistance(this.points[j + 1].current, this.parent.position, max_distance_from_parent, DistanceConstraint.MAX_DISTANCE);
        }
      }
    }
  }

  collideWithObstacles() {
    if (!this.obstacles) { return; }

    this.points.forEach((point_pair) => {
      this.obstacles.forEach((obstacle) => {
        const offset = getSpringForceDisplacement(point_pair.current, obstacle.position, obstacle.radius, SpringConstraint.PUSH);
        point_pair.current = point_pair.current.add(offset.mult(0.85));
        obstacle.position = obstacle.position.add(offset.mult(-0.15));
      })
    })
  }

  update(environment) {
    this.integratePosition(environment);
    this.applySpringConstraint(10, environment);
    this.collideWithObstacles();
  }

  draw(environment) {
    drawSmoothPath(environment.ctx, this.points.map((point_pair) => point_pair.current), "#333", 15, false);
    drawCircle(environment.ctx, this.points[this.points.length - 1].current, 20, "#333", "#999", 3)
  }
}
