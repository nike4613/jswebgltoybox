const { buildTemplates, buildJs, setOpts } = require("./build.node");

setOpts({output: "main-dev.js"});
buildTemplates();
buildJs();