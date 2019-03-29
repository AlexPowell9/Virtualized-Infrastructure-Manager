const express = require("express");
const app = express.Router();
const config = require("../config/config");
const loginControllers = require(`../${config.CONTROLLER_LOCATION}/login`);

//authenticate user every api request
app.use(loginControllers.authenticateUser);

//login functions
app.use("/login", require("./login"));

//VIM functions
app.use("/VIM", require("./VIM"));

//for getting DB data
app.use("/data", require("./findData"));

//registering a user
app.use("/register", require("./register"));

module.exports = app;
