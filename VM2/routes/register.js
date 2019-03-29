const express = require("express");
const config = require("../config/config");

let router = express.Router();

const loginControllers = require(`../${config.CONTROLLER_LOCATION}/login`);

//for registering a user
router.post("/", loginControllers.registerUser);

module.exports = router;