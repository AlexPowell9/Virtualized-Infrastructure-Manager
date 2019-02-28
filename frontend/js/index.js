function login() {
    console.log('logging in');
    // api call
    $.ajax({
        url: "localhost:8082/api/login",
        context: document.body
    })
    .done(function(data) {
        console.log(data);
    })
    .fail(function(data) {
        console.log('error');
    });
    window.location.replace('dashboard.html');
}