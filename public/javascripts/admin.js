$(document).ready(function() {
    $('#login').on('click', function() {
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
            success: function(res){
                if(res.status == 1) {
                    location.reload()
                } else {
                    $('#msg').text('Login Fail')
                }


            },
            error: function(xhr, status, error) {
                $('#msg').text('Error: '+error)
            }
        })
    })

    $('#password').on('keydown', function(e) {
        if(e.keyCode == 13) { // enter
            $('#login').click()
        }
    })

    $('#send').on('click', function() {
        var type = $.trim($('#type').find('option:selected').text().toLowerCase());
        var target = $.trim($('#target').find('option:selected').text().toLowerCase());
        $.ajax({
            url: '/admin/'+type+'/'+target,
            method: 'GET',
            contentType: 'application/json; charset=utf-8',
            data: "",
            dataType: 'json',
            success: function(res){
                if(typeof res == 'object') {
                    res = JSON.stringify(res, undefined, 4)
                    document.getElementById('result').innerHTML = syntaxHighlight(res)
                } else {
                    document.getElementById('result').innerHTML = res
                }            },
            error: function(xhr, status, error) {
                document.getElementById('result').innerHTML = error
            }
        })
    })

})

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}
