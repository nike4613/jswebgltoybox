import { ShaderProgram } from "./Shaders";

export class WebGL {
    private _canvas: HTMLCanvasElement;
    private _context: WebGLRenderingContext;

    constructor() {
        
    }

    init(canvas: HTMLCanvasElement) {
        this._canvas = canvas;

        this._context = canvas.getContext("webgl");

        // ensure context loaded
        if (!(this.gl)) {
            throw new Error("Unable to initialize WebGL. Your browser or machine may not support it.");
        }

        // Set clear color to black, fully opaque
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Clear the color buffer with specified clear color
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    useProgram(program: ShaderProgram) {
        this.gl.useProgram(program.program);
    }

    get gl(): WebGLRenderingContext {
        return this._context;
    }
}