const express = require("express");
const config = require("../config/config");

let router = express.Router();

const VIMControllers = require(`../${config.CONTROLLER_LOCATION}/VIM`);

router.post("/create", VIMControllers.createVM);

router.post("/start", VIMControllers.startVM);

router.post("/stop", VIMControllers.stopVM);

router.post("/upgrade", VIMControllers.upgradeVM);

router.post("/downgrade", VIMControllers.downgradeVM);

router.post("/delete", VIMControllers.deleteVM);

router.get("/usage/vm/:id", VIMControllers.getVmUsage);

router.get("/usage/user/:id", VIMControllers.getAllVmUsage);

module.exports = router;