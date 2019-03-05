const express = require("express");
const config = require("../config/config");
const VM = require(`../${config.MODEL_DIR}/VM`);
const VM_TEMPLATES = require(`../${config.MODEL_DIR}/vmTemplates`);
const USER = require(`../${config.MODEL_DIR}/user`);

let router = express.Router();

router.get("/vm/:id", async (req, res, next) => {
    let vm = await VM.findById(req.params.id).exec();
    if(!vm || !res.locals.user || vm.user != res.locals.user.id)return res.status(401).json("unauthorized");
    res.status(200).json(vm);
});

router.get("/template/:id", async (req, res, next) => {
    let template = await VM_TEMPLATES.findById(req.params.id).exec();
    if(!template)return res.status(404).json("Template not found");
    res.status(200).json(template);
});

router.get("/template", async (req, res, next) => {
    let templates = await VM_TEMPLATES.find().exec();
    res.status(200).json(templates);
});

router.get("/user/vm" , async (req, res, next) => {
    if(!res.locals.user || !res.locals.user.id)return res.status(401).json("unauthorized");
    let vms = await VM.find({user: res.locals.user.id});
    res.status(200).json(vms);
})

module.exports = router;