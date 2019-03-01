const VM = require(`../${config.MODEL_DIR}/VM`);
const VM_TEMPLATES = require(`../${config.MODEL_DIR}/VMTemplates`);

module.exports = {
    createVM: (req, res, next) => {
        let body = res.locals.body || req.body;
        let vmType = await VM_TEMPLATES.findById(body.vmType).exec();
        if(!vmType)return this.responses.templateDNE(res);
        let newVM = VM.create({
            type: vmType._id,
            user: res.locals.user._id,
            events: []
        });
        createdVM(res, newVM);
        if(next)next();
    },
    startVM: (req, res, next) => {
        let body = res.locals.body || req.body;
        let vm = await VM.findById(body.id).exec();
        if(this.addVMEvent(vm, body.type)){
            this.responses.startedVM(res);
            if(next)next();
        }
        else return this.eventFailed(res, body.type);
    },
    getEventType: (s) => {
        return s;
    },
    stopVM: (req, res, next) => {
        let body = res.locals.body || req.body;
        let vm = await VM.findById(body.id).exec();
        if(!vm)return this.responses.VMDNE(res);
        if(this.addVMEvent(vm, body.type)){
            this.responses.stoppedVM(res);
            if(next)next();
        }
        else return this.eventFailed(res, body.type);
    },
    upgradeVM: (req, res, next) => {
        let body = res.locals.body || req.body;
        let vm = await VM.findById(body.id).exec();
        if(!vm)return this.responses.VMDNE(res);
        if(this.addVMEvent(vm, body.type)){
            this.responses.upgradedVM(res);
            if(next)next();
        }
        else return this.eventFailed(res, body.type);
    },
    deleteVM: (req, res, next) => {
        let body = res.locals.body || req.body;
        let vm = await VM.findById(body.id).exec();
        if(!vm)return this.responses.VMDNE(res);
        if(this.addVMEvent(vm, body.type)){
            this.responses.stoppedVM(res);
            if(next)next();
        }
        else return this.eventFailed(res, body.type);
    },
    addVMEvent: (vm) => {
        if(!vm)return this.responses.VMDNE(res);
        vm.events.push({
            type: this.getEventType(body.type),
            time: Date.now()
        });
        return true;
    },
    getVMUsage: (req, res, next) => {
        let vmId = res.locals.params.id || req.params.id;
        let vm = await VM.findById(vmId).exec();
        if(!vm)return this.responses.VMDNE(res);
        let vmCharges = await getVMCharge(vm);
        this.responses.sendUsage(res, usage);
        if(next)next();
    },
    getAllVmUsage: (req, res, next) => {
        let vms = await VM.find({user: res.locals.user.id}).exec();
        let usage = [];
        vms.forEach((vm) => {
            usage.push(getVMCharge(vm));
        });
        this.responses.sendUsage(res, usage);
    },
    getVMCharge(vm){
        vmTemplates = await VM_TEMPLATES.find().exec();
        let rates = {};
        let lastStart;
        let totalTime = {};
        let vmConfigs = [];
        vmTemplates.sort((a, b) => {
            return a.rate -b.rate;
        });
        vmTemplates.forEach((element) => {
            rates[element._id] = element.rate;
            vmConfigs.push(element);
        });
        let vmConfigsIndex = vmConfigs.indexOf(vm.type);
        vm.events.forEach(element => {
            if(!totalTime[vmConfigs[vmConfigsIndex]])totalTime[vmConfigs[vmConfigsIndex]]=0;
            if(event.type === "start"){
                lastStart = element.time;
            }
            if(event.type === "stop"){
                totalTime[vmConfigs[vmConfigsIndex]]+=element.time-lastStart;
            }
            if(event.type === "upgrade"){
                totalTime[vmConfigs[vmConfigsIndex]]+=element.time-lastStart;
                vmConfigsIndex++;
                lastStart = element.time;
            }
            if(event.type === "downgrade"){
                totalTime[vmConfigs[vmConfigsIndex]]+=element.time-lastStart;
                vmConfigsIndex--;
                lastStart = element.time;
            }
            if(event.type === "delete"){
                totalTime[vmConfigs[vmConfigsIndex]]+=element.time-lastStart;
            }
        });
        let rateAndTime = {};
        rateAndTime.rate ={};
        Object.entries(totalTime).forEach((value) => {
            rateAndTime.rate[value[0]] = rates[value[0]];
        });
        rateAndTime.time = totalTime;
        return rateAndTime;
    },
    responses: {
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
            res.status(200).json("downgrade VM");
        },
        eventFailed: (res, eventType) => {
            res.status(500).json(`${eventType} failed`);
        },
        sendUsage: (res, usage) => {
            res.status(200).json(usage);
        }
    }
}