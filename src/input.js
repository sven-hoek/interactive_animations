/**
 * Register mouse and touch event listeners that update the mouse state in the environment.
 * Takes care of compensating for the window scroll position so that mouse position is in canvas coordinates.
 * @param {Environment} environment The environment object that contains the mouse state and canvas.
 */
function registerMouseEventListeners(environment) {
    document.addEventListener("mousemove", (e) => {
        environment.mouse_state.position = new Vector(e.clientX - environment.canvas.offsetLeft + window.scrollX, e.clientY - environment.canvas.offsetTop + window.scrollY);
    });
    document.addEventListener("touchmove", (e) => {
        e.preventDefault();
        const touch = e.targetTouches[0];
        environment.mouse_state.position = new Vector(touch.clientX - environment.canvas.offsetLeft + window.scrollX, touch.clientY - environment.canvas.offsetTop + window.scrollY);
    });

    document.addEventListener("mousedown", (e) => { environment.mouse_state.isDown = true; });
    document.addEventListener("touchstart", (e) => { environment.mouse_state.isDown = true; });

    document.addEventListener("mouseup", (e) => { environment.mouse_state.isDown = false; });
    document.addEventListener("touchend", (e) => { environment.mouse_state.isDown = false; });
    document.addEventListener("touchcancel", (e) => { environment.mouse_state.isDown = false; });
}

/**
 * Register slider event listener to update the value of the slider and call the callback function.
 * Requires the slider to have an id of the form <sliderName>Slider and a value display element with id <sliderName>Value.
 * The slider value is parsed as a float and displayed with the specified number of decimal places.
 * @param {string} sliderName The name of the slider, used to construct the id of the slider and value display elements.
 * @param {function} callback The function to call when the slider value changes.
 * @param {number} decimals The number of decimal places to display in the value display element. Default is 1.
 */
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



/*
var rightPressed = false;
var leftPressed = false;
var upPressed = false;
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
function keyDownHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight" || e.key == "d") {
        rightPressed = true;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft" || e.key == "a") {
        leftPressed = true;
    }
    else if(e.key == "Up" || e.key == "ArrowUp" || e.key == "w") {
        upPressed = true;
    }
}
function keyUpHandler(e) {
    if(e.key == "Right" || e.key == "ArrowRight" || e.key == "d") {
        rightPressed = false;
    }
    else if(e.key == "Left" || e.key == "ArrowLeft" || e.key == "a") {
        leftPressed = false;
    }
    else if(e.key == "Up" || e.key == "ArrowUp" || e.key == "w") {
        upPressed = false;
    }
}
*/