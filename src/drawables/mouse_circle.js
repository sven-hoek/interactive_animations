//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// A circle that keeps its center at the mouse pointer
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
class MouseCircle {
    constructor(radius) {
      this.radius = radius;
      this.position = new Vector(0, 0);
    }

    update(environment) {
      this.position = environment.mouse_state.position;
    }

    draw(environment) {
      environment.ctx.beginPath();
      environment.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI*2);
      environment.ctx.fillStyle = "#222";
      environment.ctx.fill();
      environment.ctx.strokeStyle = "#000";
      environment.ctx.lineWidth = 2;
      environment.ctx.stroke();
      environment.ctx.closePath();
    }
}
