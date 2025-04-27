class Environment2D {
    /**
     * Create an environment for 2D animations
     * @param {string} canvas_element_id Name of the canvas element
     * @param {Vector} gravity The gravity vetor
     * @param {number} frame_rate The frame/refresh rate of the animation
     * @param {number} width The width of the canvas in relation to the parent element's width (0.0 - 1.0)
     * @param {number} height The height of the canvas in relation to the window's height (0.0 - 1.0)
     */
    constructor(canvas_element_id, gravity, frame_rate, width = 1.0, height = 0.7) {
        this.canvas = document.getElementById(canvas_element_id);
        this.canvas.width = this.canvas.parentElement.offsetWidth * width;
        this.canvas.height = window.innerHeight * height;
        this.canvas.center = new Vector(this.canvas.width / 2, this.canvas.height / 2)
        this.canvas.ul = new Vector(0, 0);
        this.canvas.br = new Vector(this.canvas.width, this.canvas.height);
        this.ctx = this.canvas.getContext("2d");

        this.gravity = gravity;

        this.mouse_state = {
            position: null,
            isDown: false,
        };

        this.update_interval_ms = 1000 / frame_rate;
    }
}
