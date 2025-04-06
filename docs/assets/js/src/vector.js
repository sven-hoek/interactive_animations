//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Class representing a 2D Vector
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Vector {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }

    add(v) { return new Vector(this.x + v.x, this.y + v.y); }

    subtract(v) { return new Vector(this.x - v.x, this.y - v.y); }

    mult(s) { return new Vector(this.x * s, this.y * s); }

    rotate(a) {
      const cos_a = Math.cos(a);
      const sin_a = Math.sin(a);
      const x = cos_a * this.x - sin_a * this.y;
      const y = sin_a * this.x + cos_a * this.y;
      return new Vector(x, y);
    }

    dot(v) { return this.x * v.x + this.y * v.y; }

    getSquaredMagnitude() { return this.x * this.x + this.y * this.y; }

    getMagnitude() { return Math.sqrt(this.getSquaredMagnitude()); }

    getWithMagnitude(m) { return this.getMagnitude() > 0 ? this.mult(m / this.getMagnitude()) : new Vector(0, 0); }

    getDistance(v) { return this.subtract(v).getMagnitude(); }

    getAngle(v) { return Math.acos(this.getWithMagnitude(1).dot(v.getWithMagnitude(1))); }

    clampToRect(upper_left, bottom_right) { return new Vector(clamp(this.x, upper_left.x, bottom_right.x), clamp(this.y, upper_left.y, bottom_right.y)); }

    toString() { return `(${this.x}, ${this.y})`; }

    copy() { return new Vector(this.x, this.y); }
  }
