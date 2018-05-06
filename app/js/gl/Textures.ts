import { isPowerOf2 } from "../util/misc";
import { WebGL } from "./WebGL";

export interface TextureLoadInfo {
    image?: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
    imageData?: ImageData | ImageBitmap;
    imageBuffer?: Uint8Array | Uint16Array | Uint32Array | Float32Array;
    bufferType?: number;
    imageUrl?: string;

    /**
     * can only be one of the GLEnum texture values
     */
    format: number;
    levelOfDetail: number;

    width?: number;
    height?: number;
    border?: number;
}

export class Texture2D {
    private _gl: WebGL;
    private _tex: WebGLTexture;

    constructor(gl: WebGL) {
        this._gl = gl;
    }

    load(texinfo: TextureLoadInfo) {
        const gl = this._gl.gl;

        const tex = this._tex = gl.createTexture();
        this.bindTexture();
        
        { // Assign a temporary, empty pixel data
            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 2;
            const height = 2;
            const border = 0;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array([255, 0, 255, 255, 0, 0, 0, 255, 255, 0, 255, 255, 0, 0, 0, 255]);  // opaque blue
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                            width, height, border, srcFormat, srcType,
                            pixel);
        }

        let finishPromise: Promise<{w:number,h:number}>;

        if (texinfo.image || texinfo.imageData) {
            gl.texImage2D(gl.TEXTURE_2D, texinfo.levelOfDetail, texinfo.format, 
                            texinfo.format, gl.UNSIGNED_BYTE, texinfo.image || texinfo.imageData);
            finishPromise = Promise.resolve({
                w: (texinfo.image || texinfo.imageData).width,
                h: (texinfo.image || texinfo.imageData).height
            });
        } else if (texinfo.imageBuffer && texinfo.bufferType && texinfo.width && texinfo.height && texinfo.border) {
            gl.texImage2D(gl.TEXTURE_2D, texinfo.levelOfDetail, texinfo.format, 
                            texinfo.width!, texinfo.height!, texinfo.border!, texinfo.format, 
                            texinfo.bufferType!, texinfo.imageBuffer);
            finishPromise = Promise.resolve({
                w: texinfo.width!,
                h: texinfo.height!
            });
        } else if (texinfo.imageUrl) {
            finishPromise = (async function(): Promise<{w:number, h:number}> {
                const response = await fetch(texinfo.imageUrl, {
                    method: "GET",
                    headers: {
                        "Accept": "image/*"
                    }
                });
                // create a bitmap from response data
                const bitmap = await createImageBitmap(await response.blob());

                this.bindTexture();
                gl.texImage2D(gl.TEXTURE_2D, texinfo.levelOfDetail, texinfo.format, 
                                texinfo.format, gl.UNSIGNED_BYTE, bitmap);
                
                return {
                    w: bitmap.width,
                    h: bitmap.height
                };
            }).call(this); // call with this
        } else {
            finishPromise = Promise.reject("Invalid options");
        }
        
        finishPromise.then((v) => {
            this.bindTexture();
            if (isPowerOf2(v.w) && isPowerOf2(v.h)) {
                // Yes, it's a power of 2. Generate mips.
                gl.generateMipmap(gl.TEXTURE_2D);
            } else {
                // No, it's not a power of 2. Turn of mips and set
                // wrapping to clamp to edge
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
        });

    }

    bindTexture() {
        this._gl.gl.bindTexture(this._gl.gl.TEXTURE_2D, this._tex);
    }
}