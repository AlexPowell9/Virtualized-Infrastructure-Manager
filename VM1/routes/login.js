const express = require("express");
const config = require("../config/config");

let router = express.Router();

const loginControllers = require(`../${config.CONTROLLER_LOCATION}/login`);

//the login controllers in order of use
let login = [
    loginControllers.validate, 
    loginControllers.authenticate,
    loginControllers.generateToken
]

//posts to login
router.post("/", login);

module.exports = router;

