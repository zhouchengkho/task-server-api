/**
 * Created by zhoucheng on 8/30/16.
 */
$(document).ready(function() {
    $('#login').on('click', function () {
        var data = {
            username: $('#username').val(),
            password: $('#password').val()
        }
        $.ajax({
            url: '/admin/login',
            method: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function (res) {
                if (res.status == 1) {
                    location.reload()
                } else {
                    $('#msg').text('Login Fail')
                }


            },
            error: function (xhr, status, error) {
                $('#msg').text('Error: ' + error)
            }
        })
    })

    $('#password').on('keydown', function (e) {
        if (e.keyCode == 13) { // enter
            $('#login').click()
        }
    })
})