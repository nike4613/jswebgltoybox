import { mat4, vec2 } from "gl-matrix";
import shader_frag from "../glsl/fragment.glsl";
import shader_vert from "../glsl/vertex.glsl";
import { VertexBuffer } from "./gl/VertexBuffer";
import { Shader, ShaderProgram, ShaderType, WebGL } from "./gl/WebGL";
import { addFrameHandler, startRender } from "./gl/rendering";
import { DocumentLoad } from "./util/events";

declare global {
    interface Window {
        GL_CANVAS: string;
    }
}

var GL_CANVAS: string = window['GL_CANVAS'];

async function main() {
    await DocumentLoad;

    let canvas: HTMLCanvasElement;
    if (GL_CANVAS) 
        canvas = document.querySelector(GL_CANVAS);
    else
        throw new Error("No string GL_CANVAS avaliable on window! Cannot initialize app!");
    if (!canvas)
        throw new Error("window.GL_CANVAS didn't reference any canvas element!");

    console.log("Loaded!");

    let webgl = new WebGL();
    webgl.init(canvas);
    console.log(webgl, webgl.gl);

    let vert = Shader.create(ShaderType.Vertex).src(shader_vert).compileUsing(webgl);
    let frag = Shader.create(ShaderType.Fragment).src(shader_frag).compileUsing(webgl);

    console.log(vert, frag);
    
    let program = new ShaderProgram(frag, vert).linkWith(webgl);

    console.log(program);

    let info = program.constructInfoStruct({
        attribs: {vertexPosition: "aVertexPosition"},
        uniforms: {
            projectionMatrix: "uProjectionMatrix",
            modelViewMatrix: "uModelViewMatrix",
            resolution: "uResolution"
        }
    });

    console.log(info);

    let squarebuf = new VertexBuffer(webgl)
        .init()
        .setData([
            1.0,  1.0,
            -1.0,  1.0,
            1.0, -1.0,
            -1.0, -1.0,
        ]);
    
    console.log(squarebuf);

    function draw(delta: number): void {
        const GL = webgl.gl;

        GL.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        GL.clearDepth(1.0);                 // Clear everything
        GL.enable(GL.DEPTH_TEST);           // Enable depth testing
        GL.depthFunc(GL.LEQUAL);            // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        const sine = (Math.sin(performance.now()/1000) + 1) / 2;

        const fov = (((1-sine) * 45) + 45) * Math.PI / 180;   // in radians
        const aspect = GL.canvas.clientWidth / GL.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar);

        const modelViewMatrix = mat4.create();

        mat4.translate(modelViewMatrix,     // destination matrix
            modelViewMatrix,     // matrix to translate
            [-0.0, 0.0, /*-6.0*/ (sine + .1) * -6.0]);  // amount to translate

        squarebuf.bindAttribPointer({
            attribLocation: info.attribLocations.vertexPosition, 
            components: 2,
            normalize: false
        });

        webgl.useProgram(program);

        GL.uniformMatrix4fv(
            info.uniformLocations.projectionMatrix,
            false,
            projectionMatrix);
        GL.uniformMatrix4fv(
            info.uniformLocations.modelViewMatrix,
            false,
            modelViewMatrix);

        const resolution = vec2.create();
        resolution.set([canvas.clientWidth, canvas.clientHeight]);
        GL.uniform2fv(
            info.uniformLocations.resolution,
            resolution
        );

        {
            const offset = 0;
            const vertexCount = 4;
            GL.drawArrays(GL.TRIANGLE_STRIP, offset, vertexCount);
        }
    }

    addFrameHandler(draw);
    startRender();
}

main();