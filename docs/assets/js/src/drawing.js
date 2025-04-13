function drawCircle(ctx, center, radius, color = "#000", fillColor = null, lineWidth = 1) {
    environment.ctx.beginPath();
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