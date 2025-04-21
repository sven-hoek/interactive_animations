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

function drawLine(ctx, from, to, color = "#000", lineWidth = 1) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.closePath();
}

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
