let api = "http://127.0.0.1:8082/api";
//Initialize the invalid login symbol tooltip.
$('#loginInvalid').tooltip('update');
$("#loginForm").submit(function (e) {
    e.preventDefault();
});
/*
 * Login Function: Verifys account login
 */
function login() {
    //Get error symbol
    let errorSymbol = document.getElementById("loginInvalid");
    //Get username and password from form
    let username = document.getElementById("loginUsername").value;
    let password = document.getElementById("loginPassword").value;
    console.log(username + " " + password);
    //Send to server
    let params = {
        "username": username,
        "password": password
    };
    $.ajax({
        type: 'POST',
        url: api + "/login",
        data: params,
        dataType: "text",
        //If successful, pass token to dashboard
        success: function (resultData) {
            resultData = JSON.parse(resultData);
            window.location.href = "/dashboard.html?t=" + encodeURIComponent(resultData.token) + "&uid=" + resultData.user + "&uname=" + username;
        },
        //If unsuccessful show error
        error: function (data) {
            errorSymbol.className += " d-block";
        }
    });
}



/*
 * Register Function: Creates a new account.
 */
function register() {
    //Get success and error messages.
    let successMessage = document.getElementById("successAlert");
    let errorMessage = document.getElementById("errorAlert");
    //Get username and password from form
    let username = document.getElementById("registerUsername").value;
    let password = document.getElementById("registerPassword").value;
    if (username === '' || password === '') {
        document.getElementById("invalidRegister").classList.remove("d-none");
        return;
    }
    console.log(username + " " + password);
    //Send to server
    let params = {
        "username": username,
        "password": password
    };
    $.ajax({
        type: 'POST',
        url: api + "/register",
        data: params,
        dataType: "text",
        //If successful, show success
        success: function (resultData) {
            successMessage.className += " d-block";
            errorMessage.className += " d-hidden";
        },
        //If unsuccessful show error
        error: function (data) {
            successMessage.className += " d-hidden";
            errorMessage.className += " d-block";
        }
    });

}