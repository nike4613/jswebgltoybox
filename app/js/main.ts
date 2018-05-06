import { mat4 } from "gl-matrix";
import shader_frag from "../glsl/fragment.glsl";
import shader_vert from "../glsl/vertex.glsl";
import { GLFloatArrayBuffer, GLUint16ElementArrayBuffer } from "./gl/GLArrayBuffer";
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

    const webgl = new WebGL();
    webgl.init(canvas);

    const vert = Shader.create(ShaderType.Vertex).src(shader_vert).compileUsing(webgl);
    const frag = Shader.create(ShaderType.Fragment).src(shader_frag).compileUsing(webgl);
    
    const program = new ShaderProgram(frag, vert).linkWith(webgl);

    const info = program.constructInfoStruct({
        attribs: {
            vertexPosition: "aVertexPosition",
            vertexColor: "aVertexColor"
        },
        uniforms: {
            projectionMatrix: "uProjectionMatrix",
            modelViewMatrix: "uModelViewMatrix",
            //resolution: "uResolution"
        }
    });
    console.log(info);

    const cubebuf = new GLFloatArrayBuffer(webgl)
        .setData([
            // Front face
            -1.0, -1.0,  1.0,
            1.0, -1.0,  1.0,
            1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0, -1.0, -1.0,
            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
            1.0,  1.0,  1.0,
            1.0,  1.0, -1.0,
            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,
            // Right face
            1.0, -1.0, -1.0,
            1.0,  1.0, -1.0,
            1.0,  1.0,  1.0,
            1.0, -1.0,  1.0,
            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0,
        ])
        .setComponents(3);
    const colorbuf = new GLFloatArrayBuffer(webgl)
        .setComponents(4);
    let colorarr: number[] = [];
    const faceColors = [
        [1.0,  1.0,  1.0,  1.0],    // Front face: white
        [1.0,  0.0,  0.0,  1.0],    // Back face: red
        [0.0,  1.0,  0.0,  1.0],    // Top face: green
        [0.0,  0.0,  1.0,  1.0],    // Bottom face: blue
        [1.0,  1.0,  0.0,  1.0],    // Right face: yellow
        [1.0,  0.0,  1.0,  1.0],    // Left face: purple
    ];

    for (var j = 0; j < faceColors.length; ++j) {
        const c = faceColors[j];

        // Repeat each color four times for the four vertices of the face
        colorarr = colorarr.concat(c, c, c, c);
    }
    colorbuf.setData(colorarr);

    const idxbuf = new GLUint16ElementArrayBuffer(webgl)
        .setData([
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23,   // left
        ]);

    function draw(delta: number): void {
        const GL = webgl.gl;

        GL.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
        GL.clearDepth(1.0);                 // Clear everything
        GL.enable(GL.DEPTH_TEST);           // Enable depth testing
        GL.depthFunc(GL.LEQUAL);            // Near things obscure far things

        // Clear the canvas before we start drawing on it.

        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        const sine = (Math.sin(performance.now()/1000) + 1) / 2;
        const sine2 = (Math.sin(performance.now()/1100) + 1) / 2;
        const fovsine = (Math.sin(performance.now()/800) + 1) / 2

        const fov = ((fovsine * 45) + 45) * Math.PI / 180;   // in radians
        const aspect = GL.canvas.clientWidth / GL.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const projectionMatrix = mat4.create();

        mat4.perspective(projectionMatrix, fov, aspect, zNear, zFar);

        const modelViewMatrix = mat4.create();

        mat4.translate(modelViewMatrix,     // destination matrix
            modelViewMatrix,     // matrix to translate
            [-0.0, 0.0, /* (sine + .1) */ -6.0]);  // amount to translate
        mat4.rotate(modelViewMatrix,
            modelViewMatrix,
            sine*Math.PI*2,
            [1,0,1]);
        mat4.rotate(modelViewMatrix,
            modelViewMatrix,
            sine2*Math.PI*3,
            [1,1,0]);

        cubebuf.bindAttribPointer({
            attribLocation: info.attribLocations.vertexPosition, 
            normalize: false
        });
        colorbuf.bindAttribPointer({
            attribLocation: info.attribLocations.vertexColor,
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

        {
            idxbuf.bindBuffer(); // bind element buffer
            const vertexCount = 36;
            const offset = 0;
            GL.drawElements(GL.TRIANGLES, vertexCount, idxbuf.type, offset);
        }
    }

    addFrameHandler(draw);
    startRender();
}

main();