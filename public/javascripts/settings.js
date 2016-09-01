/**
 * Created by zhoucheng on 9/1/16.
 */
$(document).ready(function() {
    $('#change').on('click', function() {
        var data = {
            username: $('#username').val(),
            password: $('#password').val()
        }
        $.ajax({
            url: '/admin/change',
            method: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function(res){
                $('#msg').text(res.status)
            },
            error: function(xhr, status, error) {
            }
        })
    })

    $('#password').on('keydown', function(e) {
        if (e.keyCode == 13) { // enter
            $('#change').click()
        }
    })
})