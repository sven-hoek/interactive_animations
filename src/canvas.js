var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

const canvas_center = new Vector(canvas.width / 2, canvas.height / 2);
const canvas_ul = new Vector(0, 0);
const canvas_br = new Vector(canvas.width, canvas.height);

function isXWithinCanvas(x) { return x >= 0 && x <= canvas.width; }
function isYWithinCanvas(y) { return y >= 0 && y <= canvas.height; }
function isVectorWithinCanvas(v) { return isXWithinCanvas(v.x) && isYWithinCanvas(v.y); }
function clampVectorToCanvas(v) { return v.clampToRect(canvas_ul, canvas_br); }

function getRandomPosition() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    return new Vector(x, y);
}