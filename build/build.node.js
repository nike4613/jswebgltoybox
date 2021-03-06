/*import merge from "deepmerge"; = require
import ejs from "ejs";
import { ensureDir, readFile, writeFile } from "fs-extra";
import path from "path";
import { rollup } from "rollup";
import rollupTs from "rollup-plugin-typescript";*/

const merge = require("deepmerge");
const ejs = require("ejs");
const {
    ensureDir,
    readFile,
    writeFile
} = require("fs-extra");
const path = require("path");
const sh = require("shelljs");
const {
    rollup
} = require("rollup");
const rollupTs = require("rollup-plugin-typescript");
const rollupCjs = require("rollup-plugin-commonjs");
const rollupResolve = require("rollup-plugin-node-resolve");
const rollupString = require("rollup-plugin-string");
const rollupSrcmap = require('rollup-plugin-sourcemaps');

const template_ignore = ["js"];
const src_path = "app";
const out_path = "dist";

let options = {output: "main.js"};
function setOpts(opts) {
    options = merge(options, opts);
}

async function buildTemplates() {
    let index = await readFile(path.join(src_path, "html", "index.html"), 'utf8');

    let processed = ejs.render(index, {
        js_src: options.output
    });

    await ensureDir(out_path);
    await writeFile(path.join(out_path, "index.html"), processed);

    console.log("Template built");
}

async function copyResources() {
    sh.cp("-ur", path.join(src_path, "res"), path.join(out_path, "res"));
    console.log("Resources copied");
}

const rollup_inputopts = {
    input: path.join(src_path, "js", "main.ts"),
    plugins: [
        rollupResolve({
            jsnext: true,
            main: true
        }),
        rollupCjs({
            include: 'node_modules/**',
            exclude: ['node_modules/@types/**'],
            extensions: ['.js', '.ts'],
            ignoreGlobal: false,
            sourceMap: false,
        }),
        rollupTs({
            typescript: require("typescript")
        }),
        rollupString({
			// Required to be specified
			include: path.join(src_path, "**/*"),

			// Undefined by default
			exclude: [path.join(src_path, "js/**/*")]
        }),
        rollupSrcmap()
    ]
};
const rollup_outputopts = {
    format: "es",
    name: "GLApp",
    sourcemap: true
};
async function buildJs(iopts, oopts) {
    let inputopts = rollup_inputopts,
        outputopts = merge(rollup_outputopts, {file: path.join(out_path, options.output)});
    if (iopts) inputopts = merge(inputopts, iopts);
    if (oopts) outputopts = merge(outputopts, oopts);

    try {
        let bundle = await rollup(inputopts);
        //console.log(bundle.imports); // an array of external dependencies
        //console.log(bundle.exports); // an array of names exported by the entry point
        //console.log(bundle.modules); // an array of module objects
        await bundle.write(outputopts);

        console.log("JS Built");
    } catch (e) {
        console.error(e);
    }
}

module.exports = {
    buildTemplates: buildTemplates,
    buildJs: buildJs,
    setOpts: setOpts,
    copyRes: copyResources
}