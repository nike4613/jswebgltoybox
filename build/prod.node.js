const { buildTemplates, buildJs } = require("./build.node");
const rollupUglify = require("rollup-plugin-uglify");
const uglifyEs = require("uglify-es");
const rollupClosure = require("rollup-plugin-closure-compiler-js");

buildTemplates();
buildJs({
    plugins:[
        /*rollupUglify({ 
            mangle: {
                eval: true,
                /*properties: {
                    builtins: false,
                    reserved: ['GL_CANVAS', 'addEventListener', 'removeEventListener', 'querySelector', 'readyState'],
                    //domprops: false
                }* /
            },
            sourceMap: true,
            compress: {
                sequences: true,
                dead_code: true,
                conditionals: true,
                booleans: true,
                unused: true,
                if_return: true,
                join_vars: true,
                //drop_console: true
            }
        }, uglifyEs.minify)*/
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