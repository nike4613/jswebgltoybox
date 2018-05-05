

export type FrameHandler = (delta: number) => void;

let currentTime: number;
let handlers: Set<FrameHandler> = new Set();
let shouldRender: boolean = false;
function _drawFrame() {
    let newTime = performance.now();
    let delta = newTime - currentTime;
    currentTime = newTime;

    for (let handler of handlers) {
        handler(delta);
    }

    if (shouldRender) {
        requestAnimationFrame(_drawFrame);
    }
}

export function addFrameHandler(handle: FrameHandler) {
    handlers.add(handle);
}
export function removeFrameHandler(handle: FrameHandler) {
    if (handlers.has(handle))
        handlers.delete(handle);
    else
        console.warn("Attempted to deregister a frame handler that was never registered"); 
}

export function isRendering() {
    return shouldRender;
}

export function startRender() {
    shouldRender = true;
    currentTime = performance.now();
    requestAnimationFrame(_drawFrame);
}
export function stopRender() {
    shouldRender = false;
}