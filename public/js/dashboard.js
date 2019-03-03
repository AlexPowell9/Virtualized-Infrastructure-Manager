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

/*
 * Parse the url to get the paramaters for the username, id, and token.
 */
function GetUrlParamaters() {
    let url = new URL(window.location.href);
    token = url.searchParams.get("t");
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
        url: "http://127.0.0.1:8082/api/data/template",
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
        url: "http://127.0.0.1:8082/api/data/user/vm",
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
                        }
                    });
                    if (d) {
                        toRemove.push(value._id);
                    }
                }
            });
            //Big Yikes
            toRemove.forEach((value) => {
                function toFind(element) {
                    return element > value;
                }
                vmArray.splice(vmArray.findIndex(toFind), 1);
            });
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
        if (selected >= 0) {
            Select(selected);
        } else {
            Select(0);
        }
    } else {
        selected = -1;
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
        url: "http://127.0.0.1:8082/api/VIM/create",
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
        url: "http://127.0.0.1:8082/api/VIM/delete",
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
        url: "http://127.0.0.1:8082/api/VIM/start",
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
        url: "http://127.0.0.1:8082/api/VIM/stop",
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
        url: "http://127.0.0.1:8082/api/VIM/stop",
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
        url: "http://127.0.0.1:8082/api/VIM/upgrade",
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
        url: "http://127.0.0.1:8082/api/VIM/downgrade",
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

function Select(index) {
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
    console.log(vmArray);
    //Fill out details section
    document.getElementById("detailsID").innerHTML = "" + vmArray[selected]._id;
    document.getElementById("detailsName").innerHTML = "" + vmTemplates[vmArray[selected].typeIndex].name;
    document.getElementById("detailsDescription").innerHTML = "" + vmTemplates[vmArray[selected].typeIndex].description;
    document.getElementById("detailsRate").innerHTML = "$" + vmTemplates[vmArray[selected].typeIndex].rate + "/min";

    //Figure out status of VM
    document.getElementById("detailsStatus").innerHTML = "Stopped";
    if (vmArray[selected].events.length > 0) {
        for (let i = vmArray[selected].events.length - 1; i >= 0; i--) {
            if (vmArray[selected].events[i].type == "start") {
                document.getElementById("detailsStatus").innerHTML = "Running";
                break;
            } else if (vmArray[selected].events[i].type == "stop") {
                document.getElementById("detailsStatus").innerHTML = "Stopped";
                break;
            }
        }
    }

    document.getElementById("detailsUsage").innerHTML = "$" + vmTemplates[vmArray[selected].typeIndex].rate + "/min";
}


/*
 * Logout function that take user back to homepage.
 */
function logout() {
    window.location.replace('index.html');
}