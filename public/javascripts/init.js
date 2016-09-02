/**
 * Created by zhoucheng on 9/2/16.
 */
$(document).ready(function() {
    $('#init').on('click', function() {
        $.ajax({
            url: '/admin/init',
            method: 'POST',
            data: '',
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            success: function(res){
                $('#msg').text(res.status)
            },
            error: function(xhr, status, error) {
            }
        })
    })
})