function clamp(x, min, max) { return Math.max(min, Math.min(x, max)); }

function isWithinRange(x, min, max) { return x >= min && x <= max; }

function isWithinRect(v, ul, br) { return isWithinRange(v.x, ul.x, br.x) && isWithinRange(v.y, ul.y, br.y); }

function getRandomPositionInRect(ul, br) {
    const width_height = br.subtract(ul);
    const x = Math.random() * width_height.x;
    const y = Math.random() * width_height.y;
    return new Vector(x, y).add(ul);
}
