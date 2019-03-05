function login() {
    console.log('logging in');
    // api call
    var params ={username: "test", password: "password"};
    $.ajax({
        type: 'POST',
        url: "http://127.0.0.1:8082/api/login",
        data: params,
        dataType: "text",
        success: function (resultData) {
            alert("Save Complete")
        },
        error: function (data) {
            alert("Something went wrong");
            console.log(data);
        }
    });

}