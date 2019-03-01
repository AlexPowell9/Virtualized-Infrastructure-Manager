const express = require("express");
const app = express.Router();
const config = require("../config/config");
const loginControllers = require(`../${config.CONTROLLER_LOCATION}/login`);

app.use(loginControllers.authenticateUser);

app.use("/login", require("./login"));

app.use("/VIM", require("./VIM"));

app.use("/data", require("./findData"));

app.use("/register", require("./register"));

module.exports = app;
