const express = require("express");
const config = require("../config/config");

let router = express.Router();

const loginControllers = require(`../${config.CONTROLLER_LOCATION}/login`);

let login = [
    loginControllers.validate, 
    loginControllers.authenticate,
    loginControllers.generateToken
]

router.post("/", login);

module.exports = router;

