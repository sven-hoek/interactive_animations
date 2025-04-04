var mouse_state = {
    position: new Vector(0, 0),
    isDown: false,
};

document.addEventListener("mousemove", (e) => {
    mouse_state.position = new Vector(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
});
document.addEventListener("mousedown", (e) => { mouse_state.isDown = true; });
document.addEventListener("mouseup", (e) => { mouse_state.isDown = false; });