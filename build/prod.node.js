const { buildTemplates, buildJs, setOpts } = require("./build.node");
const rollupUglify = require("rollup-plugin-uglify");
const uglifyEs = require("uglify-es");
const rollupClosure = require("rollup-plugin-closure-compiler-js");

setOpts({output: "main-prod.js"});
buildTemplates();
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