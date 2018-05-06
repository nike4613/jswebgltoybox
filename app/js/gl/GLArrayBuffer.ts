import { TypedArray } from "../util/misc";
import { WebGL, WebGLAttribLocation } from "./WebGL";

export interface AttribPointerOptions {
    attribLocation: WebGLAttribLocation;
    normalize: boolean;
}

export type TypedArrayType = new (data: number[]) => TypedArray;
export abstract class GLArrayBuffer {
    private _gl: WebGL;
    private _buf: WebGLBuffer;
    private _glenumType: number;
    private _arrayType: TypedArrayType;
    private _usage: number;

    protected constructor(gl: WebGL, enumtype: number, arraytype: TypedArrayType, usage: number) {
        this._gl = gl;

        this._glenumType = enumtype;
        this._arrayType = arraytype;
        this._usage = usage;

        this._buf = gl.gl.createBuffer();
    }

    setData(data: number[]): this {
        const gl = this._gl.gl;

        this.bindBuffer();
        gl.bufferData(this._glenumType, new this._arrayType(data), this._usage);

        return this;
    }

    bindBuffer() {
        this._gl.gl.bindBuffer(this._glenumType, this._buf);
    }
    
    protected set _glType(type: number) {
        this._glenumType = type;
    }

    protected get _GL() {
        return this._gl;
    }

    get buffer(): WebGLBuffer {
        return this._buf;
    }
}

export class GLFloatArrayBuffer extends GLArrayBuffer {
    private _components: number;

    constructor(gl: WebGL) {
        super(gl, gl.gl.ARRAY_BUFFER, Float32Array, gl.gl.STATIC_DRAW);
    }

    setComponents(num: number): GLFloatArrayBuffer {
        this._components = num;
        return this;
    }

    bindAttribPointer(opts: AttribPointerOptions) {
        const gl = this._GL.gl;

        this.bindBuffer();
        gl.vertexAttribPointer(opts.attribLocation, this.components,
                               gl.FLOAT, opts.normalize, 0, 0);
        gl.enableVertexAttribArray(opts.attribLocation);
    }

    get components(): number {
        return this._components;
    }
}

export abstract class GLElementArrayBuffer extends GLArrayBuffer {
    private _type: number;

    constructor(gl: WebGL, type: TypedArrayType, gltype: number) {
        super(gl, gl.gl.ELEMENT_ARRAY_BUFFER, type, gl.gl.STATIC_DRAW);
        this._type = gltype;
    }

    get type(): number {
        return this._type;
    }
}

export class GLUint16ElementArrayBuffer extends GLElementArrayBuffer {
    constructor(gl: WebGL) {
        super(gl, Uint16Array, gl.gl.UNSIGNED_SHORT);
    }
}