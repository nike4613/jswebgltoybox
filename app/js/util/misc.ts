
export type TypedArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint16Array | Uint32Array | Float32Array | Float64Array | Uint8ClampedArray;

export function isPowerOf2(value: number): boolean {
    return (value & (value - 1)) === 0;
}