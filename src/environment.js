class Environment2D {
    constructor(canvas_element_id, gravity) {
        this.canvas = document.getElementById("myCanvas");
        this.canvas.center = new Vector(this.canvas.width / 2, this.canvas.height / 2)
        this.canvas.ul = new Vector(0, 0);
        this.canvas.br = new Vector(this.canvas.width, this.canvas.height);
        this.ctx = this.canvas.getContext("2d");

        this.gravity = gravity;

        this.mouse_state = {
            position: null,
            isDown: false,
        };
    }
}
