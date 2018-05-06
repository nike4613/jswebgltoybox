import { assert } from "../util/assert";
import { WebGL } from "./WebGL";

/** begin stupid const enum workaround */
type ShaderType = number;
type eShaderType = {Vertex:ShaderType,Fragment:ShaderType};
export var ShaderType: eShaderType = {
    Vertex: 0,
    Fragment: 1
};
/* end stupid const enum workaround **/

export class Shader {
    public source: string;
    public type: ShaderType;
    private _shader: WebGLShader;

    static create(type: ShaderType): Shader {
        let shader = new Shader();
        shader.type = type;
        return shader;
    }

    src(src: string): Shader {
        this.source = src;
        return this;
    }

    compileUsing(gl: WebGL): Shader {
        //throw new Error("Method not implemented.");
        let type: number; // = gl.gl.VERTEX_SHADER
        switch (this.type) {
            case ShaderType.Vertex:
                type = gl.gl.VERTEX_SHADER;
                break;
            case ShaderType.Fragment:
                type = gl.gl.FRAGMENT_SHADER;
                break;
        }

        const shader = gl.gl.createShader(type);

        // Send the source to the shader object

        gl.gl.shaderSource(shader, this.source);

        // Compile the shader program

        gl.gl.compileShader(shader);

        // See if it compiled successfully

        if (!gl.gl.getShaderParameter(shader, gl.gl.COMPILE_STATUS)) {
            let err = 'An error occurred compiling the shaders: ' + gl.gl.getShaderInfoLog(shader);
            gl.gl.deleteShader(shader);
            throw new Error(err);
        }

        this._shader = shader;

        return this;
    }
    get shader() {
        return this._shader;
    }
}

export type ShaderAttribLocation = number; 
export type ShaderUniformLocation = WebGLUniformLocation;

export interface ProgramInfoDefinition {
    attribs: {[name: string]: string}; // [internal name]: attrib name
    uniforms: {[name: string]: string}; // [internal name]: uniform name
}

export interface ProgramInfoStruct {
    program: ShaderProgram;
    attribLocations: {[name: string]: ShaderAttribLocation}; // [internal name]: location
    uniformLocations: {[name: string]: ShaderUniformLocation}; // [internal name]: location
}

export class ShaderProgram {
    private _frag: Shader;
    private _vert: Shader;
    private _program: WebGLProgram;
    private _gl: WebGL

    constructor(fragment: Shader, vertex: Shader) {
        assert(fragment.type === ShaderType.Fragment);
        assert(vertex.type === ShaderType.Vertex);
        this._frag = fragment;
        this._vert = vertex;
    }

    linkWith(gl: WebGL): ShaderProgram {
        const shaderProgram = gl.gl.createProgram();
        gl.gl.attachShader(shaderProgram, this._vert.shader);
        gl.gl.attachShader(shaderProgram, this._frag.shader);
        gl.gl.linkProgram(shaderProgram);
      
        // If creating the shader program failed, alert
      
        if (!gl.gl.getProgramParameter(shaderProgram, gl.gl.LINK_STATUS)) {
          let err = 'Unable to initialize the shader program: ' + gl.gl.getProgramInfoLog(shaderProgram);
          throw new Error(err);
        }

        this._program = shaderProgram;
        this._gl = gl;

        return this;
    }

    getUniformLocation(name: string): ShaderUniformLocation {
        return this._gl.gl.getUniformLocation(this.program, name);
    }
    getAttribLocation(name: string): ShaderAttribLocation {
        return this._gl.gl.getAttribLocation(this.program, name);
    }

    constructInfoStruct(def: ProgramInfoDefinition): ProgramInfoStruct {
        let struct = {program:null,attribLocations:{},uniformLocations:{}} as ProgramInfoStruct;
        struct.program = this;
        
        for (let key in def.attribs)
            struct.attribLocations[key] = this.getAttribLocation(def.attribs[key]);
        for (let key in def.uniforms)
            struct.uniformLocations[key] = this.getUniformLocation(def.uniforms[key]);

        return struct;
    }

    get program(): WebGLProgram {
        return this._program;
    }
    get fragment(): Shader {
        return this._frag;
    }
    get vertex(): Shader {
        return this._vert;
    }
}