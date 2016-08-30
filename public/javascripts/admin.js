$(document).ready(function() {

    $('#type').on('change', function() {
        var type = $.trim($(this).find('option:selected').text().toLowerCase());
        var username = $('#username')
        var password = $('#password')
        switch(type) {
            case 'list':
                username.attr('disabled', 'disabled');
                password.attr('disabled', 'disabled');
                break;
            case 'find':
                username.removeAttr('disabled');
                password.attr('disabled', 'disabled');
                break;
            case 'update':
                username.removeAttr('disabled');
                password.removeAttr('disabled');
                break;
            case 'delete':
                username.removeAttr('disabled');
                password.attr('disabled', 'disabled');
                break;
            case 'add':
                username.removeAttr('disabled');
                password.removeAttr('disabled');
                break;
            default:
                break;
        }
    })

    $('#gen-password').on('click', function() {
        $('#password').val(generateUUID())
    })

    $('#send').on('click', function() {
        var type = $.trim($('#type').find('option:selected').text().toLowerCase());
        var target = $.trim($('#target').find('option:selected').text().toLowerCase());
        var method = '';
        var data = '';
        var url = '/admin/'+type+'/'+target;
        switch (type) {
            case 'list':
                method = 'GET'
                break;
            case 'find':
                method = 'GET'
                url = url+'?username='+ $('#username').val()
                break;
            case 'update':
                method = 'POST';
                data = {
                    username: $('#username').val(),
                    password: $('#password').val()
                }
                data = JSON.stringify(data)
                break;
            case 'delete':
                method = 'POST';
                data = {
                    username: $('#username').val(),
                }
                data = JSON.stringify(data)
                break;
            case 'add':
                method = 'POST';
                data = {
                    username: $('#username').val(),
                    password: $('#password').val()
                }
                data = JSON.stringify(data)
                break;
            default:
                break;
        }
        $.ajax({
            url: url,
            method: method,
            contentType: 'application/json; charset=utf-8',
            data: data,
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

function generateUUID(){
    var d = new Date().getTime();
    if(window.performance && typeof window.performance.now === "function"){
        d += performance.now(); //use high-precision timer if available
    }
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
}