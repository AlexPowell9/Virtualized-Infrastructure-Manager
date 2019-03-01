const config = require("./config/config");
const express = require("express");
var bodyParser = require('body-parser');

const setupEnv = require(`./${config.SETUP_ENV_LOCATION}`);

let start = async ()=>{
    await setupEnv();
    const app = express();
    app.use(bodyParser.json({
        limit: '10mb'
    }));
    app.use(bodyParser.urlencoded({
        limit: '10mb',
        extended: true
    }));
    app.use("/api", require(`./${config.ROUTES_DIR}/index`))
    app.listen(config.SERVER_PORT, config.functions.onServerStart);
}
start();
