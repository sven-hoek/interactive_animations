/**
 * Clamping function to restrict a value within a specified range.
 * @param {number} x The input value to clamp
 * @param {number} min The lower bound of the range
 * @param {number} max The upper bound of the range
 * @returns The clamped value, which is guaranteed to be within the range [min, max]
 */
function clamp(x, min, max) { return Math.max(min, Math.min(x, max)); }

/**
 * Wrap a number (e.g. an array index) to ensure it stays within a specified range. Wraps around in a circular manner.
 * @param {number} i The input value to wrap
 * @param {number} max The upper bound of the range
 * @returns The wrapped value, which is guaranteed to be within the range [0, max)
 * @example
 * wrapIndex(5, 3) // returns 2
 * wrapIndex(-1, 3) // returns 2
 */
function wrapIndex(i, max) { return (i + max) % max; }

/**
 * Check if a value is within a specified range.
 * @param {number} x The value to check
 * @param {number} min The lower bound of the range
 * @param {number} max The upper bound of the range
 * @returns 
 */
function isWithinRange(x, min, max) { return x >= min && x <= max; }

/**
 * Checks if a vector is within a specified rectangle defined by its upper-left and bottom-right corners.
 * @param {Vector} v The vector to check
 * @param {Vector} ul The upper-left corner of the rectangle
 * @param {Vector} br The bottom-right corner of the rectangle
 * @returns `true` if the vector is within the rectangle, `false` otherwise
 */
function isWithinRect(v, ul, br) { return isWithinRange(v.x, ul.x, br.x) && isWithinRange(v.y, ul.y, br.y); }

/**
 * Get a random position within a rectangle defined by its upper-left and bottom-right corners.
 * @param {Vector} ul The upper-left corner of the rectangle
 * @param {Vector} br The bottom-right corner of the rectangle
 * @returns A vector representing a random position within the rectangle
 */
function getRandomPositionInRect(ul, br) {
    const width_height = br.subtract(ul);
    const x = Math.random() * width_height.x;
    const y = Math.random() * width_height.y;
    return new Vector(x, y).add(ul);
}

const DistanceConstraint = Object.freeze({
    MIN_DISTANCE: 0,
    MAX_DISTANCE: 1,
    FIXED_DISTANCE: 2,
});

/**
 * Project a point along the line defined by the vector from the point to the anchor, such that the distance to the
 * anchor is equal or restricted to a specified distance, depending on the distance constraint type.
 * @param {Vector} point The point to project
 * @param {Vector} anchor The anchor point
 * @param {number} distance The distance for the projection
 * @param {DistanceConstraint} distance_constraint The type of distance constraint to apply
 * @returns A new vector representing the projected point
 */
function constrainDistance(point, anchor, distance, distance_constraint) {
    const diff = anchor.subtract(point);
    const distance_to_anchor = diff.getMagnitude();
    if (distance_constraint === DistanceConstraint.FIXED_DISTANCE ||
        (distance_constraint === DistanceConstraint.MIN_DISTANCE && distance_to_anchor < distance) ||
        (distance_constraint === DistanceConstraint.MAX_DISTANCE && distance_to_anchor > distance)) {
        return point.add(diff.getWithMagnitude(distance_to_anchor - distance));
    }
    else { return point; }
}

const SpringConstraint = Object.freeze({
    PULL: 0,
    PUSH: 1,
    BOTH: 2,
});

/**
 * Get the spring force displacement vector based on the distance to the anchor point and the specified distance.
 * @param {Vector} point The first point
 * @param {Vector} anchor The second point
 * @param {number} distance The distance for the spring force (e.g. the rest length of the spring)
 * @param {SpringConstraint} spring_constraint The type of spring constraint to apply
 * @returns An offset vector representing the spring force displacement. Can be scaled by a spring constant and also divided between the two points.
 * E.g., for equally distributed spring force, do point.add(offset.mult(0.5)) and anchor.add(offset.mult(-0.5)).
 */
function getSpringForceDisplacement(point, anchor, distance, spring_constraint) {
    const diff = anchor.subtract(point);
    const distance_to_anchor = diff.getMagnitude();
    if (spring_constraint == SpringConstraint.BOTH ||
        (spring_constraint == SpringConstraint.PUSH && distance_to_anchor < distance) ||
        (spring_constraint == SpringConstraint.PULL && distance_to_anchor > distance)) {
        return offset = diff.getWithMagnitude(distance_to_anchor - distance);
    }
    else { return new Vector(0, 0); }
}
