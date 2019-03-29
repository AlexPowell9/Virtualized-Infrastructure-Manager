const config =require("../config/config");
const VM = require(`../${config.MODEL_DIR}/VM`);
const VM_TEMPLATES = require(`../${config.MODEL_DIR}/vmTemplates`);

let createVM =  async (req, res, next) => {
    let body = res.locals.body || req.body;
    //get all of the vm templates
    let vmType = await VM_TEMPLATES.findById(body.vmType).exec();
    if(!vmType)return responses.templateDNE(res);//if the template doesn't exist
    let newVM = await VM.create({//create the vm
        type: vmType._id,
        user: res.locals.user.id,
        events: []
    });
    responses.createdVM(res, newVM);//return the new vm
    if(next)next();//call next function if it exists
};
let startVM = async (req, res, next) => {
    let body = res.locals.body || req.body;
    //get the vm
    let vm = await VM.findById(body.id).exec();
    if(!vm)return responses.VMDNE(res);//if the vm doesn't exist
    if(addVMEvent(vm, "start")){//add an event to the vm of type start
        responses.startedVM(res);//return success message
        if(next)next();
    }
    else return responses.eventFailed(res, body.type);//if the event has failed
}
let getEventType = (s) => {
    return s;//this is for future use if the events match to a different string
}
let stopVM = async (req, res, next) => {
    let body = res.locals.body || req.body;
    //get the vm
    let vm = await VM.findById(body.id).exec();
    if(!vm)return responses.VMDNE(res);//if vm doesn't exist
    if(addVMEvent(vm, "stop")){//add the stop event
        responses.stoppedVM(res);//on success
        if(next)next();
    }
    else return eventFailed(res, body.type);//on failure
}
let upgradeVM = async (req, res, next) => {
    let body = res.locals.body || req.body;
    //get the vm
    let vm = await VM.findById(body.id).exec();
    if(!vm)return responses.VMDNE(res);
    if(addVMEvent(vm, "upgrade")){//add the upgrade event
        responses.upgradedVM(res);
        if(next)next();
    }
    else return responses.eventFailed(res, body.type);
}
let downgradeVM = async (req, res, next) => {
    let body = res.locals.body || req.body;
    let vm = await VM.findById(body.id).exec();
    if(!vm)return responses.VMDNE(res);
    if(addVMEvent(vm, "downgrade")){//add the downgrade event
        responses.downgradedVM(res);
        if(next)next();
    }
    else return responses.eventFailed(res, body.type);
}
let deleteVM = async (req, res, next) => {
    let body = res.locals.body || req.body;
    let vm = await VM.findById(body.id).exec();
    if(!vm)return responses.VMDNE(res);
    if(addVMEvent(vm, "delete")){//add the delete event
        responses.stoppedVM(res);
        if(next)next();
    }
    else return responses.eventFailed(res, body.type);
}
let addVMEvent = (vm, type) => {
    //if the last event deleted the vm, there can be no more events
    if(vm.events[vm.events.length -1] === "delete")return false;//failure
    vm.events.push({//push the new event
        type: getEventType(type),
        time: Date.now() 
    });
    vm.save();//save the vm
    return true;//success
}
let getVmUsage = async (req, res, next) => {
    //get the id of the vm - has ability for the id to be passed from another handler, for future use
    let vmId = (res.locals.params?req.locals.params.id:0) || req.params.id;
    //get the vm
    let vm = await VM.findById(vmId).exec();
    if(!vm)return responses.VMDNE(res);//vm doesn't exist
    //get the vm charges - requires date parse due to the date being passed as a timestamp
    let vmCharges = await getVMCharge(vm, new Date(parseInt(req.query.start)), new Date(parseInt(req.query.end)));
    responses.sendUsage(res, vmCharges);//send the usage back to the user
    if(next)next();
}
let getAllVmUsage = async (req, res, next) => {
    //get the vms of the current user
    let vms = await VM.find({user: res.locals.user.id}).exec();
    let usage = [];//usages to 
    for(let i = 0; i < vms.length;i++){
        //calculate the usage for all vms
        let u = await getVMCharge(vms[i], new Date(parseInt(req.query.start)), new Date(parseInt(req.query.end)));
        usage.push(u);
    }
    responses.sendUsage(res, usage);//send the usage back
}
//returns true if the vm is running at a specific time, false otherwise
let isRunning = (vm ,time) => {
    let running = false;
    vm.events.forEach((event) => {
        if(event.time>time)return;
        if(event.type === "start")running = true;
        if(event.type === "stop" || event.type === "delete")running = false;
    });
    return running;
}
//returns the number of upgrades and downgrades before a specific time
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
    let events = vm.events;//get vm events
    if(events.length === 0)return {};//return nothing if no events
    if(startDate){//only cut events if there is a startDate
        if(startDate > Date.now())return {};//if the startdate is after current date return nothing
        let startIndex = events.findIndex((value) => {//find the point in the array where dates are all after the startDate
            return value.time >= startDate;
        });
        //if nothing was found, the startDate must be after all of the events
        if(startIndex === -1)startIndex = events.length;
        //remove all unwanted events
        events = events.slice(startIndex, events.length);
        if(isRunning(vm, startDate)){//if the vm is running at the startDate, we need to add an event to start counting time
            events.unshift({
                type: "start",
                time: startDate
            });
        }
    }
    if(endDate){
        if(endDate > Date.now())endDate = Date.now();//don't prorate charges, only count until now
        let endIndex = events.length-1;//fallback index is last index
        for(let i = events.length -1; i >= 0; i--){
            if(events[i].time <= endDate)endIndex=i;break;//find index where all events are before the endDate
        }
        //if one wasn't found all dates must be included
        if(endIndex === -1)endIndex = events.length-1;
        events = events.slice(0, endIndex+1);//cut the unwanted events
        if(isRunning(vm, endDate)){//if it still running at the endDate, add an event to stop counting
            events.push({
                type: "stop",
                time: endDate
            });
        }
    }
    //find all of the vm templates
    vmTemplates = await VM_TEMPLATES.find().exec();
    let rates = {};
    let totalTime = {};
    let vmConfigs = [];
    //sort the vms in cost ordering
    vmTemplates.sort((a, b) => {
        return a.rate - b.rate;
    });
    //add the rates for each event and put all of the configs in an array
    vmTemplates.forEach((element) => {
        rates[element._id] = element.rate;
        vmConfigs.push(element);
    });
    let vmConfigsIndex = 0;
    //find the index of the vm template for the vm
    for(let i = 0; i < vmConfigs.length; i++){
        if(vmConfigs[i]._id == vm.type){
            vmConfigsIndex=i;
            break;
        }
    }
    //get the number of upgrades at the startDate and add that to the vm index
    vmConfigsIndex += numUpgrade(vm, startDate);
    let lastStart = null;//just need to declare this
    let running = isRunning(vm, startDate);//is the vm running at the startDate
    events.forEach(element => {
        if(!totalTime[vmConfigs[vmConfigsIndex]._id])totalTime[vmConfigs[vmConfigsIndex]._id]=0;//initialize the time
        if(element.type === "start"){
            lastStart = element.time;//last start time for the vm
            running = true;//the vm is now running
        }
        if(element.type === "stop"){
            //calculate the delta since the last start time
            if(lastStart)totalTime[vmConfigs[vmConfigsIndex]._id]+=element.time-lastStart;
            running = false;//vm is not running anymore
        }
        if(element.type === "upgrade"){
            if(running && lastStart){//if the vm is running we need to calculate another delta
                //calculate time for the last vm type
                totalTime[vmConfigs[vmConfigsIndex]._id]+=element.time-lastStart;
                lastStart = element.time;
            }
            //upgrade the vm
            vmConfigsIndex++; 
        }
        if(element.type === "downgrade"){
            if(running && lastStart){//same as above
                totalTime[vmConfigs[vmConfigsIndex]._id]+=element.time-lastStart;
                lastStart = element.time;
            }
            //downgrade the vm
            vmConfigsIndex--;
        }
        if(element.type === "delete"){
            //if the cm is deleted calculate the delta
            if(lastStart)totalTime[vmConfigs[vmConfigsIndex]._id]+=element.time-lastStart;
            running = false;
        }
    });
    let rateAndTime = {};//this for sending the rates
    rateAndTime.rate ={};//split time and rates
    Object.entries(totalTime).forEach((value) => {
        rateAndTime.rate[value[0]] = rates[value[0]];//put the rates in with the ids of the template as the key
    });
    rateAndTime.time = totalTime;//send the time
    return rateAndTime;//return the rates and time
}
let responses = {//these are the commonly used responses
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

//exports for the module
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
