/**
 *  server configuration, mostly file locations and important functions that might be  
 *  shared
 */

const scrypt = require("scrypt");


module.exports = {
    //constants
    ROUTES_DIR: "routes",
    SETUP_ENV_LOCATION: "setup",
    SETUP_TEST_ENV_LOCATION: "testSetup",
    TOKEN_EXPIRY: 5000,
    SERVER_PORT: 8082,
    CONTROLLER_LOCATION: "controllers",
    MODEL_DIR: "models",
    dbUri: "mongodb://localhost:27017/vim",
    SCRYPT_PARAMS: scrypt.paramsSync(0.1),
    //functions
    functions: {
        onServerStart: require("./onStart"),
    }
}
