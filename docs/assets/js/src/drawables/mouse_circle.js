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
    drawCircle(environment.ctx, this.position, this.radius, "#000", "#334", 2);
  }
}
