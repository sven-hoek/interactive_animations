class Environment2D {
    constructor(canvas_element_id, gravity, frame_rate) {
        this.canvas = document.getElementById(canvas_element_id);
        this.canvas.width = this.canvas.parentElement.offsetWidth;
        this.canvas.height = window.innerHeight * 0.7;
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

function registerFloatSlider(sliderName, callback, decimals = 1) {
    const slider = document.getElementById(sliderName + "Slider");
    const slider_value = document.getElementById(sliderName + "Value");

    slider.addEventListener("input", (event) => {
        const value = parseFloat(event.target.value);
        slider_value.textContent = value.toFixed(decimals);

        if (callback) {
            callback(value);
        }
    });
}
