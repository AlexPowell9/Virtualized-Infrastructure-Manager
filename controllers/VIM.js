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
    deleteVM: (req, res, next) => {
        
    },
    addVMEvent: (vm) => {
        if(!vm)return this.responses.VMDNE(res);
        vm.events.push({
            type: this.getEventType(body.type),
            time: Date.now()
        });
        return true;
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
        }
    }
}