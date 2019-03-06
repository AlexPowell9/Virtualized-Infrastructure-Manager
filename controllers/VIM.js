const config =require("../config/config");
const VM = require(`../${config.MODEL_DIR}/VM`);
const VM_TEMPLATES = require(`../${config.MODEL_DIR}/vmTemplates`);

let createVM =  async (req, res, next) => {
        let body = res.locals.body || req.body;
        let vmType = await VM_TEMPLATES.findById(body.vmType).exec();
        if(!vmType)return responses.templateDNE(res);
        let newVM = await VM.create({
            type: vmType._id,
            user: res.locals.user.id,
            events: []
        });
        responses.createdVM(res, newVM);
        if(next)next();
    };
let startVM = async (req, res, next) => {
        let body = res.locals.body || req.body;
        let vm = await VM.findById(body.id).exec();
        if(!vm)return responses.VMDNE(res);
        if(addVMEvent(vm, "start")){
            responses.startedVM(res);
            if(next)next();
        }
        else return responses.eventFailed(res, body.type);
    }
let getEventType = (s) => {
        return s;
    }
let stopVM = async (req, res, next) => {
        let body = res.locals.body || req.body;
        let vm = await VM.findById(body.id).exec();
        if(!vm)return responses.VMDNE(res);
        if(addVMEvent(vm, "stop")){
            responses.stoppedVM(res);
            if(next)next();
        }
        else return eventFailed(res, body.type);
    }
let upgradeVM = async (req, res, next) => {
        let body = res.locals.body || req.body;
        let vm = await VM.findById(body.id).exec();
        if(!vm)return responses.VMDNE(res);
        if(addVMEvent(vm, "upgrade")){
            responses.upgradedVM(res);
            if(next)next();
        }
        else return responses.eventFailed(res, body.type);
    }
let downgradeVM = async (req, res, next) => {
        let body = res.locals.body || req.body;
        let vm = await VM.findById(body.id).exec();
        if(!vm)return responses.VMDNE(res);
        if(addVMEvent(vm, "downgrade")){
            responses.downgradedVM(res);
            if(next)next();
        }
        else return responses.eventFailed(res, body.type);
    }
let deleteVM = async (req, res, next) => {
        let body = res.locals.body || req.body;
        let vm = await VM.findById(body.id).exec();
        if(!vm)return responses.VMDNE(res);
        if(addVMEvent(vm, "delete")){
            responses.stoppedVM(res);
            if(next)next();
        }
        else return responses.eventFailed(res, body.type);
    }
let addVMEvent = (vm, type) => {
        vm.events.push({
            type: getEventType(type),
            time: Date.now()
        });
        vm.save();
        return true;
    }
let getVmUsage = async (req, res, next) => {
        let vmId = (res.locals.params?req.locals.params.id:0) || req.params.id;
        let vm = await VM.findById(vmId).exec();
        if(!vm)return responses.VMDNE(res);
        let vmCharges = await getVMCharge(vm);
        responses.sendUsage(res, vmCharges);
        if(next)next();
    }
let getAllVmUsage = async (req, res, next) => {
        let vms = await VM.find({user: res.locals.user.id}).exec();
        console.log(vms);
        let usage = [];
        for(let i = 0; i < vms.length;i++){
            let u = await getVMCharge(vms[i]);
            usage.push(u);
        }
        responses.sendUsage(res, usage);
    }
let isRunnning = (vm ,time) => {
    let running = false;
    vm.events.forEach((event) => {
        if(event.time>time)return;
        if(event.type === "start")running = true;
        if(event.type === "stop" || event.type === "delete")running = false;
    });
    return running;
}
let numUpgrade = (vm , time) => {
    let upgrade = 0;
    vm.events.forEach((event) => {
        if(event.time> time)return;
        if(event.type==="upgrade")upgrade++;
        if(event.type==="downgrade")upgrade--;
    });
    return upgrade;
}
let getVMCharge = async (vm, startDate, endDate) => {
        let startIndex = 0;
        let endIndex = 0;
        let events = vm.events;
        if(startDate){
            startIndex = events.findIndex((value) => {
                return value.time >= startDate;
            });
            if(startIndex === -1)return {};
            events = events.slice(startIndex, events.length-1);
            if(isRunnning(vm, startDate)){
                events.unshift({
                    type: "start",
                    time: startDate
                });
            }
        }
        if(endDate){
            let endIndex = vm.events.findIndex((value) => {
                return value.time <= endDate;
            });
            if(endIndex === -1)return {};
            events = events.slice(0, endIndex);
            if(isRunning(vm, endDate)){
                events.push({
                    type: "stop",
                    time: endDate
                })
            }
        }
        vmTemplates = await VM_TEMPLATES.find().exec();
        let rates = {};
        let totalTime = {};
        let vmConfigs = [];
        vmTemplates.sort((a, b) => {
            return a.rate - b.rate;
        });
        vmTemplates.forEach((element) => {
            rates[element._id] = element.rate;
            vmConfigs.push(element);
        });
        let vmConfigsIndex = 0;
        for(let i = 0; i < vmConfigs.length; i++){
            if(vmConfigs[i]._id === vm.type)vmConfigsIndex=i;break;
        }
        vmConfigsIndex += numUpgrade(vm, startDate);
        let laststart;
        events.forEach(element => {
            if(!totalTime[vmConfigs[vmConfigsIndex]._id])totalTime[vmConfigs[vmConfigsIndex]._id]=0;
            if(element.type === "start"){
                lastStart = element.time;
            }
            if(element.type === "stop"){
                totalTime[vmConfigs[vmConfigsIndex]._id]+=element.time-lastStart;
            }
            if(element.type === "upgrade"){
                totalTime[vmConfigs[vmConfigsIndex]._id]+=element.time-lastStart;
                vmConfigsIndex++;
                lastStart = element.time;
            }
            if(element.type === "downgrade"){
                totalTime[vmConfigs[vmConfigsIndex]._id]+=element.time-lastStart;
                vmConfigsIndex--;
                lastStart = element.time;
            }
            if(element.type === "delete"){
                totalTime[vmConfigs[vmConfigsIndex]._id]+=element.time-lastStart;
            }
        });
        let rateAndTime = {};
        rateAndTime.rate ={};
        Object.entries(totalTime).forEach((value) => {
            rateAndTime.rate[value[0]] = rates[value[0]];
        });
        rateAndTime.time = totalTime;
        return rateAndTime;
    }
let responses = {
        templateDNE: (res) => {
            res.status(404).json("VM template does not exist");
        },
        VMDNE: (res) => {
            res.status(404).json("VM does not exist");
        },
        createdVM: (res, VM ) => {
            res.status(201).json(VM);
        },
        startedVM: (res) => {
            res.status(200).json("started VM");
        },
        stoppedVM: (res) => {
            res.status(200).json("stopped VM");
        },
        upgradedVM: (res) => {
            res.status(200).json("upgraded VM");
        },
        downgradedVM: (res) => {
            res.status(200).json("downgraded VM");
        },
        eventFailed: (res, eventType) => {
            res.status(500).json(`${eventType} failed`);
        },
        sendUsage: (res, usage) => {
            res.status(200).json(usage);
        }
    }

    module.exports = {
        createVM: createVM,
        startVM: startVM,
        stopVM: stopVM,
        upgradeVM: upgradeVM,
        downgradeVM: downgradeVM,
        deleteVM: deleteVM,
        getVmUsage: getVmUsage,
        getAllVmUsage: getAllVmUsage
    }
