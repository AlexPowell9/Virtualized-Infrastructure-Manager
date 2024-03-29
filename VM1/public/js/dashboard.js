let api = "http://127.0.0.1:8082/api";
//Define globals, this is a surprise tool that will help us later.
let token;
let userID;
let vmArray = [];
let selected = -1;
let vmTemplates = [];
let vmList = document.getElementById("listVM");

//Get params
GetUrlParamaters();
//Get Templates
GetVMTemplates();
//Get User's VMs
GetUserVMs();

$(function () {
    $('#startTimePicker').datetimepicker({
        defaultDate: new Date('Mar 1, 2019'),
        icons: {
            time: 'far fa-clock',
            date: 'far fa-calendar-alt',
            up: 'fas fa-arrow-up',
            down: 'fas fa-arrow-down',
            previous: 'fas fa-chevron-left',
            next: 'fas fa-chevron-right',
            today: 'far fa-calendar-check',
            clear: 'far fa-trash-alt',
            close: 'fas fa-times'
        }
    });
    $('#endTimePicker').datetimepicker({
        defaultDate: new Date(),
        icons: {
            time: 'far fa-clock',
            date: 'far fa-calendar-alt',
            up: 'fas fa-arrow-up',
            down: 'fas fa-arrow-down',
            previous: 'fas fa-chevron-left',
            next: 'fas fa-chevron-right',
            today: 'far fa-calendar-check',
            clear: 'far fa-trash-alt',
            close: 'fas fa-times'
        }
    });
    $("#startTimePicker").on("change.datetimepicker", function (e) {
        $('#endTimePicker').datetimepicker('minDate', e.date);
    });
    $("#endTimePicker").on("change.datetimepicker", function (e) {
        $('#startTimePicker').datetimepicker('maxDate', e.date);
    });
});

/*
 * Parse the url to get the paramaters for the username, id, and token.
 */
function GetUrlParamaters() {
    let url = new URL(window.location.href);
    token = decodeURIComponent(url.searchParams.get("t"));
    userID = url.searchParams.get("uid");
    //Set username on nav
    document.getElementById("navbarUsername").innerHTML = url.searchParams.get("uname");
}

/*
 * Function to get VM Templates
 */
function GetVMTemplates() {
    let params = {};
    $.ajax({
        type: 'GET',
        url: api + "/data/template",
        data: params,
        dataType: "text",
        //Attach auth header
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        //If successful, show success
        success: function (resultData) {
            vmTemplates = JSON.parse(resultData);
        },
        //If unsuccessful show error
        error: function (data) {
            console.log("Get Templates Error");
            console.log(data);
        }
    });
}

/*
 * Function to get User's VMs
 */
function GetUserVMs() {
    let params = {};
    $.ajax({
        type: 'GET',
        url: api + "/data/user/vm",
        data: params,
        dataType: "text",
        //Attach auth header
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        //If successful, show success
        success: function (resultData) {
            vmArray = JSON.parse(resultData);
            //Show VMs in DOM
            let toRemove = [];
            vmArray.forEach((value, index) => {
                if (value.events.length > 0) {
                    let d = false;
                    value.events.forEach((v) => {
                        if (v.type == "delete") {
                            //I love cancer
                            d = true;
                            console.log(value._id);
                        }
                    });
                    if (d) {
                        toRemove.push(value._id);
                    }
                }
            });
            //Big Yikes
            for (let i = 0; i < toRemove.length; i++) {
                vmArray.splice(vmArray.findIndex(x => x._id == toRemove[i]), 1);
            }
            // toRemove.forEach((value) => {
            //     console.log("Position " + vmArray.findIndex(x=> x == value));
            //     vmArray.splice(vmArray.findIndex(x=> x == value), 1);
            // });
            UpdateList();
        },
        //If unsuccessful show error
        error: function (data) {
            console.log("Get Templates Error");
            console.log(data);
        }
    });
}

/*
 * Function for populating the list with VMs
 */
function UpdateList() {
    vmList.innerHTML = '';
    vmArray.forEach((value, index) => {
        let newVM = document.createElement('a');
        let hrefText = "javascript:Select(" + (index) + ");";
        newVM.setAttribute("href", hrefText);
        newVM.classList.add("list-group-item");
        newVM.classList.add("list-group-item-action");
        vmTemplates.forEach((v, i) => {
            if (value.type == v._id) {
                vmArray[index].typeIndex = i;
            }
        });
        vmArray[index].events.forEach((v, i) => {
            if (v.type == "upgrade") {
                vmArray[index].typeIndex++;
            } else if (v.type == "downgrade") {
                vmArray[index].typeIndex--;
            }
        });
        newVM.appendChild(document.createTextNode(vmTemplates[vmArray[index].typeIndex].name));
        vmList.appendChild(newVM);
    });
    if (vmArray.length > 0) {
        if (selected > 0) {
            Select(selected);
        } else {
            Select(0);
        }
    } else {
        selected = -1;
        document.getElementById("vmdetails").style.display = "none";
    }
}

/*
 * Create VM Function
 */
function CreateVM(index) {
    //create vm api
    let params = {
        vmType: vmTemplates[index]
    };
    $.ajax({
        type: 'POST',
        url: api + "/VIM/create",
        data: params,
        dataType: "text",
        //Attach auth header
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        //If successful, show success
        success: function (resultData) {
            vmArray.push(JSON.parse(resultData));
            //Reflect changes DOM
            UpdateList();
        },
        //If unsuccessful show error
        error: function (data) {
            console.log("Create VM Error");
            console.log(data);
        }
    });
}

/*
 * Delete VM Function
 */
function DeleteVM() {
    let params = {
        id: vmArray[selected]._id
    };
    $.ajax({
        type: 'POST',
        url: api + "/VIM/delete",
        data: params,
        dataType: "text",
        //Attach auth header
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        //If successful, show success
        success: function (resultData) {
            selected--;
            //Excessive but gets the job done.
            GetUserVMs();
        },
        //If unsuccessful show error
        error: function (data) {
            console.log("Delete VM Error");
            console.log(data);
        }
    });
}

/*
 * Start VM Function
 */
function StartVM() {
    let params = {
        id: vmArray[selected]._id
    };
    $.ajax({
        type: 'POST',
        url: api + "/VIM/start",
        data: params,
        dataType: "text",
        //Attach auth header
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        //If successful, show success
        success: function (resultData) {
            //Excessive but gets the job done.
            GetUserVMs();
        },
        //If unsuccessful show error
        error: function (data) {
            console.log("Start VM Error");
            console.log(data);
        }
    });
}

/*
 * Stop VM Function
 */
function StopVM() {
    let params = {
        id: vmArray[selected]._id
    };
    $.ajax({
        type: 'POST',
        url: api + "/VIM/stop",
        data: params,
        dataType: "text",
        //Attach auth header
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        //If successful, show success
        success: function (resultData) {
            //Excessive but gets the job done.
            GetUserVMs();
        },
        //If unsuccessful show error
        error: function (data) {
            console.log("Stop VM Error");
            console.log(data);
        }
    });
}

/*
 * Stop VM Function
 */
function StopVM() {
    let params = {
        id: vmArray[selected]._id
    };
    $.ajax({
        type: 'POST',
        url: api + "/VIM/stop",
        data: params,
        dataType: "text",
        //Attach auth header
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        //If successful, show success
        success: function (resultData) {
            //Excessive but gets the job done.
            GetUserVMs();
        },
        //If unsuccessful show error
        error: function (data) {
            console.log("Stop VM Error");
            console.log(data);
        }
    });
}

/*
 * Upgrade VM Function
 */
function UpgradeVM() {
    let params = {
        id: vmArray[selected]._id
    };
    $.ajax({
        type: 'POST',
        url: api + "/VIM/upgrade",
        data: params,
        dataType: "text",
        //Attach auth header
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        //If successful, show success
        success: function (resultData) {
            //Excessive but gets the job done.
            GetUserVMs();
        },
        //If unsuccessful show error
        error: function (data) {
            console.log("Upgrade VM Error");
            console.log(data);
        }
    });
}

/*
 * Downgrade VM Function
 */
function DowngradeVM() {
    let params = {
        id: vmArray[selected]._id
    };
    $.ajax({
        type: 'POST',
        url: api + "/VIM/downgrade",
        data: params,
        dataType: "text",
        //Attach auth header
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        //If successful, show success
        success: function (resultData) {
            //Excessive but gets the job done.
            GetUserVMs();
        },
        //If unsuccessful show error
        error: function (data) {
            console.log("Downgrade VM Error");
            console.log(data);
        }
    });
}

/*
 * Get VM Usage Function
 */
function GetUsageVM() {
    let params = {
        start: new Date(document.getElementById("startTimePickerInput").value).getTime(),
        end: new Date(document.getElementById("endTimePickerInput").value).getTime()
    };
    $.ajax({
        type: 'GET',
        url: api + "/VIM/usage/vm/" + vmArray[selected]._id,
        data: params,
        dataType: "text",
        //Attach auth header
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        //If successful, show success
        success: function (resultData) {
            resultData = JSON.parse(resultData);
            let totalUsage = 0;
            if (resultData.rate == null) {
                UpdateVMUsage(totalUsage);
                return;
            }
            Object.entries(resultData.rate).forEach((entry, index) => {
                totalUsage += (resultData.time[Object.keys(resultData.time)[index]] / 60000);
                // let key = entry[0];
                // let value = entry[1];
            });
            UpdateVMUsage(totalUsage);
        },
        //If unsuccessful show error
        error: function (data) {
            console.log("Get Usage VM Error");
            console.log(data);
        }
    });
}

/*
 * Get Total Charges Function
 */
function GetTotalCharges() {
    let params = {
        start: new Date(document.getElementById("startTimePickerInput").value).getTime(),
        end: new Date(document.getElementById("endTimePickerInput").value).getTime()
    };
    $.ajax({
        type: 'GET',
        url: api + "/VIM/usage/user/" + userID,
        data: params,
        dataType: "text",
        //Attach auth header
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + token);
        },
        //If successful, show success
        success: function (resultData) {
            resultData = JSON.parse(resultData);
            console.log(resultData);
            let totalUsage = 0;
            resultData.forEach((value, index) => {
                if (value.rate != null) {
                    Object.entries(value.rate).forEach((entry, index) => {
                        totalUsage += (value.time[Object.keys(value.time)[index]] / 60000) * entry[1];
                        // let key = entry[0];
                        // let value = entry[1];
                    });
                }
            });
            UpdateTotalCharges(totalUsage);
        },
        //If unsuccessful show error
        error: function (data) {
            console.log("Get Total Charges Error");
            console.log(data);
        }
    });
}

function Select(index) {
    console.log(index);
    //Select the list element
    selected = index;
    if (selected < 0) {
        return;
    }
    //Remove active tags
    for (let i = 0; i < vmList.childNodes.length; i++) {
        vmList.childNodes[i].classList.remove("active");
    }
    //Add active tags
    vmList.childNodes[selected].classList.add("active");

    //Fill out details section
    document.getElementById("vmdetails").style.display = "block";
    document.getElementById("detailsID").innerHTML = "" + vmArray[selected]._id;
    document.getElementById("detailsName").innerHTML = "" + vmTemplates[vmArray[selected].typeIndex].name;
    document.getElementById("detailsDescription").innerHTML = "" + vmTemplates[vmArray[selected].typeIndex].description;
    document.getElementById("detailsRate").innerHTML = "$" + vmTemplates[vmArray[selected].typeIndex].rate + "/min";

    //Figure out status of VM
    document.getElementById("detailsStatus").innerHTML = "Stopped";
    ShowStartStop(true);
    if (vmArray[selected].events.length > 0) {
        for (let i = vmArray[selected].events.length - 1; i >= 0; i--) {
            if (vmArray[selected].events[i].type == "start") {
                document.getElementById("detailsStatus").innerHTML = "Running";
                ShowStartStop();
                break;
            } else if (vmArray[selected].events[i].type == "stop") {
                document.getElementById("detailsStatus").innerHTML = "Stopped";
                ShowStartStop(true);
                break;
            }
        }
    }

    //Display correct upgrade downgrade combo.
    ShowUpgradeDowngrade();

    //Get usage and charges
    GetUsageVM();
    GetTotalCharges();
}

/*
 * Update VM Usage Display
 */
function UpdateVMUsage(usage) {
    document.getElementById("detailsUsage").innerHTML = usage.toFixed(1) + " minutes";
}

/*
 * Update Total Charges Display
 */
function UpdateTotalCharges(totalCharges) {
    document.getElementById("detailsTotalCharges").innerHTML = "$" + totalCharges.toFixed(2);
}

/*
 * Start and Stop should not be available at the same time. This will mess up usage calculations on the server because no validation because spaghetti because school stressy messy.
 */
function ShowStartStop(showStart) {
    if (showStart) {
        document.getElementById("controlsStart").classList.remove("d-none");
        document.getElementById("controlsStop").classList.add("d-none");
    } else {
        document.getElementById("controlsStart").classList.add("d-none");
        document.getElementById("controlsStop").classList.remove("d-none");
    }
}

/*
 * Function to only show valid upgrade/downgrade buttons assuming 3 templates. Love hardcoding stuff. 
 */
function ShowUpgradeDowngrade() {
    if (vmArray[selected].typeIndex == 0) {
        document.getElementById("controlsUpgrade").classList.remove("d-none");
        document.getElementById("controlsDowngrade").classList.add("d-none");
    } else if (vmArray[selected].typeIndex == 2) {
        document.getElementById("controlsUpgrade").classList.add("d-none");
        document.getElementById("controlsDowngrade").classList.remove("d-none");
    } else {
        document.getElementById("controlsUpgrade").classList.remove("d-none");
        document.getElementById("controlsDowngrade").classList.remove("d-none");
    }
}

/*
 * Logout function that take user back to homepage.
 */
function logout() {
    window.location.replace('index.html');
}