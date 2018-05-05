import { WebGL, WebGLAttribLocation } from "./WebGL";

export interface AttribPointerOptions {
    attribLocation: WebGLAttribLocation;
    components: number; // num components per vert
    normalize: boolean;
}

export class VertexBuffer {
    private _gl: WebGL;
    private _buf: WebGLBuffer;

    constructor(gl: WebGL) {
        this._gl = gl;
    }
    
    init(): VertexBuffer {
        const gl = this._gl.gl;
        this._buf = gl.createBuffer();

        return this;
    }

    setData(data: number[]): VertexBuffer {
        const gl = this._gl.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this._buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

        return this;
    }

    bindAttribPointer(opts: AttribPointerOptions) {
        const gl = this._gl.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, this._buf);
        gl.vertexAttribPointer(opts.attribLocation, opts.components,
                               gl.FLOAT, opts.normalize, 0, 0);
        gl.enableVertexAttribArray(opts.attribLocation);
    }

    get buffer(): WebGLBuffer {
        return this._buf;
    }
}