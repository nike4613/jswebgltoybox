const { buildTemplates, buildJs } = require("./build.node");
const rollupUglify = require("rollup-plugin-uglify");
const uglifyEs = require("uglify-es");

buildTemplates();
buildJs({
    plugins:[
        rollupUglify({ 
            mangle: true,
        }, uglifyEs.minify)
    ]
},{
    format: "iife"
});