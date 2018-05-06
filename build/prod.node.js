const { buildTemplates, buildJs, copyRes, setOpts } = require("./build.node");
const rollupClosure = require("rollup-plugin-closure-compiler-js");

setOpts({output: "main-prod.js"});
buildJs({
    plugins:[
        rollupClosure({
            compilationLevel: "ADVANCED",
            languageIn: "ECMASCRIPT_2017",
            languageOut: "ECMASCRIPT_2017",
            createSourceMap: true
        })
    ]
},{
    format: "iife"
});
buildTemplates();
copyRes();