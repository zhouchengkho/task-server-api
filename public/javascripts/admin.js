$(document).ready(function() {


    var target = $.trim($('#target').find('option:selected').text().toLowerCase());

    var customerField = [
        { name: "id", type: "text", width: 50, readOnly: true},
        { name: "verifyCode", type:"text", width: 70 },
        { name: "email", type: "text", width: 100 },
        { name: "alive", type: "checkbox", width: 50, title: "Is Alive", sorting: false },
        { name: 'lastActive', type: 'text', width: 70, readOnly:true},
        // { name: "createdAt", type: 'text', width: 100, readOnly: true},
        { type: "control" }
    ];

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

    $('#logout').on('click', function() {
        $.ajax({
            url: '/admin/logout',
            method: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: "",
            dataType: 'json',
            success: function(res){
                if(res.status == 1) {
                    location.href = '/'
                }
            },
            error: function(xhr, status, error) {
            }
        })
    })



    $("#table").jsGrid({
        width: "100%",

        inserting: true,
        editing: true,
        sorting: true,
        paging: true,
        pageSize: 10,
        autoload: true,
        filtering: true,
        // data: [],

        controller: {
           loadData: function(filter) {
               console.log(JSON.stringify(filter))
               var data = $.Deferred();
               $.ajax({
                   type: "GET",
                   contentType: "application/json; charset=utf-8",
                   url: "/admin/list/customer",
                   dataType: "json"
               }).done(function(response){
                   data.resolve(response.data);
               });
               return data.promise();
           },
            updateItem: function(item, editedItem) {
                console.log('item: '+JSON.stringify(item));
                console.log('edited: '+JSON.stringify(editedItem))
                var data = $.Deferred();
                data.resolve({id:'update'})
                return data.promise()
            }
        },

        fields: target === 'customer' ? customerField : []
    });



    function fetchData(url, method, data) {
        var options = {
            url: url,
            method: method,
            contentType: 'application/json; charset=utf-8',
            data: data,
            success: function(res){
                // alert('success '+JSON.stringify(res.data))
                return res.data;
            },
            error: function(xhr, status, error) {
                console.log(error)
            }
        }
        if(method === 'POST')
            options.dataType = 'json'

        return $.ajax(options)
    }

})
