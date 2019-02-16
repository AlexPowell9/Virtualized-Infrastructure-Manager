/**
 *  server configuration, mostly file locations and important functions that might be  *  shared
 */
module.exports = {
    //constants
    ROUTES_DIR: "routes",
    SETUP_ENV_LOCATION: "setup",
    SETUP_TEST_ENV_LOCATION: "testSetup",
    //functions
    functions: {
        onServerStart: require("./onStart"),
    }
}
