const express = require("express");
const config = require("../config/config");

let router = express.Router();

const loginControllers = require(`../${config.CONTROLLER_LOCATION}/login`);

router.post("/", [loginControllers.validateInput, 
    loginControllers.authenticate,
    loginControllers.generateToken
]);

module.exports = router;