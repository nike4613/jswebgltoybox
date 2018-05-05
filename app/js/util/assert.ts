
export function assert(expr: boolean) {
    if (!expr) throw new Error("AssertionError");
}