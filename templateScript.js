const mongoose = require("mongoose");
const config = require("./config/config");
mongoose.connect(config.dbUri).catch((e) =>{
    console.log(e);
});
const VM_TEMPLATES = require(`./${config.MODEL_DIR}/vmTemplates`);


let createVms = async () => {
    await VM_TEMPLATES.create({
        description: "8 virtual processor cores, 16 GB of virtual RAM, 20 GB of storage space in the root file system",
        rate: 0.05,
        name: "Basic  Virtual Server Instance"
    });
    
    await VM_TEMPLATES.create({
        description: "32 virtual processor cores, 64 GB of virtual RAM, 20 GB of storage space in the root file system ",
        rate: 0.10,
        name: "Large Virtual Server Instance"
    });
    
    await VM_TEMPLATES.create({
        description: "128 virtual processor cores, 512 GB of virtual RAM, 40 GB of storage space in the root file system-",
        rate: 0.15,
        name: "Ultra-Large Virtual Server Instanc"
    });
    exit(0);
}