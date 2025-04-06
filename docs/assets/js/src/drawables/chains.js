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
        environment.ctx.beginPath();
        environment.ctx.arc(point.x, point.y, this.link_length, 0, Math.PI*2);
        environment.ctx.strokeStyle = "#CCC";
        environment.ctx.stroke();
        environment.ctx.closePath();

        if (i > 0) {
          const previous = points[i - 1];
          environment.ctx.beginPath();
          environment.ctx.moveTo(previous.x, previous.y);
          environment.ctx.lineTo(point.x, point.y);
          environment.ctx.strokeStyle = "#333";
          environment.ctx.stroke();
          environment.ctx.closePath();
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
        environment.ctx.beginPath();
        environment.ctx.arc(point.x, point.y, this.link_length, 0, Math.PI*2);
        environment.ctx.strokeStyle = "#333";
        environment.ctx.stroke();
        environment.ctx.closePath();

        if (i > 0) {
          const previous = points[i - 1];
          environment.ctx.beginPath();
          environment.ctx.moveTo(previous.x, previous.y);
          environment.ctx.lineTo(point.x, point.y);
          environment.ctx.strokeStyle = "#CCC";
          environment.ctx.stroke();
          environment.ctx.closePath();
        }
      });
    }
}