/**
 * Created by zhoucheng on 8/25/16.
 */


var baseUrl = '/api/';
$(document).ready(function() {
    $('#verifyjson').on('click', function() {
        if(verifyJSON()) {
            $('#verifymsg').text('Success')

        } else {
            $('#verifymsg').text('Syntax Error')
        }
    })



    $('#send').on('click', function() {
        send();
    })


})


function send() {
    var method = $('#method').val() == 0 ? 'GET':'POST';
    var url = $('#url').val();
    if(!verifyJSON()) {
        $('#verifymsg').text('Syntax Error')
        return;
    }
    var reqBody = $('#jsontext').val() ? $('#jsontext').val() : "";
    $.ajax({
        url: baseUrl + url,
        method: method,
        contentType: 'application/json; charset=utf-8',
        data: reqBody,
        dataType: 'json',
        success: function(res){
            if(typeof res == 'object') {
                res = JSON.stringify(res, undefined, 4)
                document.getElementById('result').innerHTML = syntaxHighlight(res)
            } else {
                document.getElementById('result').innerHTML = res
            }


        },
        error: function(xhr, status, error) {
            document.getElementById('result').innerHTML = error
        }
    })
}

function verifyJSON() {
    var content = $('#jsontext').val();
    if(content) {
        try {
            JSON.parse(content)
        } catch(e) {
            return false;
        }
    }
    return true;
}
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
