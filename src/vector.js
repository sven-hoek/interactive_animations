//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Class representing a 2D Vector
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class Vector {
  /**
   * Construct a 2D vector from cartesian coordinates.
   * @param {number} x The x-coordinate of the vector.
   * @param {number} y The y-coordinate of the vector.
   */
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  /**
   * Construct a 2D vector from polar coordinates.
   * @param {number} r The radius (magnitude) of the vector.
   * @param {number} theta The angle (in radians) of the vector.
   * @returns {Vector} A new vector with the specified polar coordinates.
   */
  static fromPolar(r, theta) { return new Vector(r * Math.cos(theta), r * Math.sin(theta)); }

  /**
   * Get the sum of this vector and another vector.
   * @param {Vector} v The vector to add to this vector.
   * @returns {Vector} The sum of this vector and the specified vector.
   */
  add(v) { return new Vector(this.x + v.x, this.y + v.y); }

  /**
   * Get the difference of this vector and another vector.
   * @param {Vector} v The vector to subtract from this vector.
   * @returns {Vector} The difference of this vector and the specified vector.
   */
  subtract(v) { return new Vector(this.x - v.x, this.y - v.y); }

  /**
   * Get the element-wise product of this vector and a scalar.
   * @param {number} s The scalar to multiply this vector by.
   * @returns {Vector} The product of this vector and the specified scalar.
   */
  mult(s) { return new Vector(this.x * s, this.y * s); }

  /**
   * Rotate this vector by a specified angle.
   * @param {number} a The angle (in radians) to rotate the vector by.
   * @returns {Vector} The rotated vector.
   */
  rotate(a) {
    const cos_a = Math.cos(a);
    const sin_a = Math.sin(a);
    const x = cos_a * this.x - sin_a * this.y;
    const y = sin_a * this.x + cos_a * this.y;
    return new Vector(x, y);
  }

  /**
   * Calculate the dot product of this vector and another vector.
   * @param {Vector} v The vector to calculate the dot product with.
   * @returns {number} The dot product of this vector and the specified vector.
   */
  dot(v) { return this.x * v.x + this.y * v.y; }

  /**
   * Calculate the squared magnitude of this vector.
   * @returns {number} The squared magnitude of this vector.
   */
  getSquaredMagnitude() { return this.x * this.x + this.y * this.y; }

  /**
   * Calculate the magnitude of this vector.
   * @returns {number} The magnitude of this vector.
   */
  getMagnitude() { return Math.sqrt(this.getSquaredMagnitude()); }

  /**
   * Get a new vector with the same direction as this vector but with a specified magnitude.
   * @param {number} m The magnitude to scale the vector to. Negative values will reverse the direction of the vector.
   * @returns {Vector} A new vector with the same direction as this vector but with the specified magnitude.
   */
  getWithMagnitude(m) { return this.getMagnitude() > 0 ? this.mult(m / this.getMagnitude()) : new Vector(0, 0); }

  /**
   * Get the distance between this vector and another vector.
   * @param {Vector} v The other vector to calculate the distance to.
   * @returns {number} The distance between this vector and the specified vector.
   */
  getDistance(v) { return this.subtract(v).getMagnitude(); }

  /**
   * Get the angle between this vector and another vector.
   * @param {Vector} v The other vector to calculate the angle with.
   * @returns {number} The angle (in radians) between this vector and the specified vector.
   */
  getAngle(v) { return Math.acos(this.getWithMagnitude(1).dot(v.getWithMagnitude(1))); }

  /**
   * Clamp this vector to be within the defined rectangle, optionally with a given distance/margin to this rectangle's border.
   * @param {Vector} upper_left The upper left corner of the rectangle.
   * @param {Vector} bottom_right The bottom right corner of the rectangle.
   * @param {number} margin The margin to the rectangle.
   * @returns A new vector that's guaranteed to be within the given rectangle.
   */
  clampToRect(upper_left, bottom_right, margin = 0.0) { return new Vector(clamp(this.x, upper_left.x + margin, bottom_right.x - margin), clamp(this.y, upper_left.y + margin, bottom_right.y - margin)); }

  /**
   * Get a string representation of the vector.
   * @returns A string representation of the Vector.
   */
  toString() { return `(${this.x}, ${this.y})`; }

  /**
   * Make a copy of this vector.
   * @returns A new Vector with the same coordinates.
   */
  copy() { return new Vector(this.x, this.y); }
}
