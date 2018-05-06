const { buildTemplates, buildJs, copyRes, setOpts } = require("./build.node");

setOpts({output: "main-dev.js"});
buildJs();
buildTemplates();
copyRes();