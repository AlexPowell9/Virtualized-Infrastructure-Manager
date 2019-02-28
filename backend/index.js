const config = require("./config/config");

const setupEnv = require(`./${config.SETUP_ENV_LOCATION}`);

let start = async ()=>{
    await setupEnv();
    const app = require(`./${config.ROUTES_DIR}/index`);
    app.listen(config.SERVER_PORT, config.functions.onServerStart);
}
start();
