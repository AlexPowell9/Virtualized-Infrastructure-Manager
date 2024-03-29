/**
 *  server configuration, mostly file locations and important functions that might be  
 *  shared
 */

const scrypt = require("scrypt");


module.exports = {
    //constants
    API_SERVER_IP: "http://127.0.0.1:10000",
    ROUTES_DIR: "routes",//routes location
    SETUP_ENV_LOCATION: "setup",//setup location
    SETUP_TEST_ENV_LOCATION: "testSetup",//test location
    TOKEN_EXPIRY: 5000,//token expiry, milliseconds
    SERVER_PORT: 8082,//server port
    CONTROLLER_LOCATION: "controllers",//where are the controllers
    MODEL_DIR: "models",
    dbUri: "mongodb://cyores:corsair@10.0.0.6:27017/a3",//database location
    SCRYPT_PARAMS: scrypt.paramsSync(0.1),//scrypt parameters
    //functions
    functions: {
        onServerStart: require("./onStart"),//on start location
    }
}
