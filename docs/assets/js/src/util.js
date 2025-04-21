function clamp(x, min, max) { return Math.max(min, Math.min(x, max)); }

function wrapIndex(i, max) { return (i + max) % max; }

function isWithinRange(x, min, max) { return x >= min && x <= max; }

function isWithinRect(v, ul, br) { return isWithinRange(v.x, ul.x, br.x) && isWithinRange(v.y, ul.y, br.y); }

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