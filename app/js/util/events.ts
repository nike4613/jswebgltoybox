

export var DocumentLoad = new Promise((acc: Function, rej: Function) => {
    let func = function handle() {
        if (document.readyState === "complete") {
            document.removeEventListener("readystatechange", func);
            acc(...arguments);
        }
    };
    document.addEventListener("readystatechange", func);
    func();
});