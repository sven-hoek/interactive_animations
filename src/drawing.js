/**
 * Draw a circle on the canvas
 * @param {CanvasRenderingContext2D} ctx The canvas context
 * @param {Vector} center The center of the circle
 * @param {number} radius The radius of the circle
 * @param {string} color The color of the circle outline
 * @param {string} fillColor The color to fill the circle with
 * @param {number} lineWidth The line width of the circle outline
 */
function drawCircle(ctx, center, radius, color = "#000", fillColor = null, lineWidth = 2) {
    environment.ctx.beginPath();
    environment.ctx.lineWidth = lineWidth;
    environment.ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);

    if (color) {
        environment.ctx.strokeStyle = color;
        environment.ctx.stroke();
    }

    if (fillColor) {
        environment.ctx.fillStyle = fillColor;
        environment.ctx.fill();
    }
    environment.ctx.closePath();
}

/**
 * Draw a straight line between two points on the canvas
 * @param {CanvasRenderingContext2D} ctx The canvas context
 * @param {Vector} from The starting point of the line
 * @param {Vector} to The ending point of the line
 * @param {string} color The stroke color of the line
 * @param {number} lineWidth The line width
 */
function drawLine(ctx, from, to, color = "#000", lineWidth = 1) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.closePath();
}

/**
 * Draw a straight line with an arrowhead at the end
 * @param {CanvasRenderingContext2D} ctx The canvas context
 * @param {Vector} from The starting point
 * @param {Vector} to The endoing point
 * @param {string} color The color of the arrow
 * @param {number} lineWidth The line width of the arrow
 * @param {number} headLength The head length of the arrow
 */
function drawArrow(ctx, from, to, color = "#000", lineWidth = 1, headLength = 10) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    ctx.beginPath();

    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);

    ctx.lineTo(
        to.x - headLength * Math.cos(angle - Math.PI / 6),
        to.y - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(
        to.x - headLength * Math.cos(angle + Math.PI / 6),
        to.y - headLength * Math.sin(angle + Math.PI / 6)
    );

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.closePath();
}

/**
 * Draw a smooth path along a set of points
 * @param {CanvasRenderingContext2D} ctx The canvas context
 * @param {Vector[]} points The points to draw the path along
 * @param {string} color The color of the path
 * @param {number} lineWidth The line width of the path
 * @param {bool} closePath If `true`, the first and the last point will be connected
 * @param {string?} fillColor When closing the path, fill with this color
 * @returns 
 */
function drawSmoothPath(ctx, points, color = "#000", lineWidth = 1, closePath = true, fillColor = null) {
    if (points.length < 2) return;

    const first_point = points[0];
    const last_point = points[points.length - 1];
    const mid_point_first_last = first_point.add(last_point).mult(0.5);

    ctx.beginPath();

    if (closePath) { ctx.moveTo(mid_point_first_last.x, mid_point_first_last.y); }
    else { ctx.moveTo(first_point.x, first_point.y); }

    points.slice(1).forEach((point, i) => {
        const prev = points[i];
        const mid_point = point.add(prev).mult(0.5);
        ctx.quadraticCurveTo(prev.x, prev.y, mid_point.x, mid_point.y);
    })

    if (closePath) {
        ctx.quadraticCurveTo(last_point.x, last_point.y, mid_point_first_last.x, mid_point_first_last.y);
        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
        }
    } else {
        ctx.lineTo(last_point.x, last_point.y);
    }

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    ctx.closePath();
}

function drawFractalTreeLine(ctx, start, length, branch_angle, current_angle, current_level, color = "#111", shortening_factor = 1.0) {
    if (current_level < 0) { return; }

    const end = start.add(Vector.fromPolar(length, current_angle));
    drawLine(ctx, start, end, color, current_level);

    drawFractalTreeLine(ctx, end, length * shortening_factor, branch_angle, current_angle + branch_angle, current_level - 1, color, shortening_factor);
    drawFractalTreeLine(ctx, end, length * shortening_factor, branch_angle, current_angle - branch_angle, current_level - 1, color, shortening_factor);
}
