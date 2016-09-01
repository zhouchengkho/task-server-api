$(document).ready(function() {


    var target = $.trim($('#target').find('option:selected').text().toLowerCase());

    var customerField = [
        { name: "id", type: "text", width: 50, editing: false},
        { name: "verifyCode", type:"text", width: 70 },
        { name: "email", type: "text", width: 70 },
        { name: 'lastActive', type: 'text', width: 60, readOnly:true},
        { name: "createdAt", type: 'text', width: 60, readOnly: true},
        { type: "control" }
    ];

    var clientField = [
        { name: "id", type: "text", width: 50, editing: false},
        { name: "password", type:"text", width: 70 },
        { name: "email", type: "text", width: 70 },
        { name: 'successCount', type: 'number', width: 20, title: 'S'},
        { name: 'failCount', type: 'number', width: 20, title: 'F'},
        { name: 'lastActive', type: 'text', width: 60, readOnly:true},
        { name: "createdAt", type: 'text', width: 60, readOnly: true},
        { type: "control" }
    ]

    var gridOption = {
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
                var url = '/admin/list/' + target;
                var iniFilter = true
                for(var entry in filter) {
                    if(filter[entry] && filter[entry] != '') {
                        if(iniFilter) {
                            url = url + '?' + entry + '=' + filter[entry]
                            iniFilter = false
                        } else {
                            url = url + '&' + entry + '=' + filter[entry]
                        }
                    }
                }
                console.log(url)
                var data = $.Deferred();
                $.ajax({
                    type: 'GET',
                    contentType: 'application/json; charset=utf-8',
                    url: url,
                    dataType: 'json'
                }).done(function(response){
                    data.resolve(response.data);
                });
                return data.promise();
            },
            updateItem: function(item) {
                var url = '/admin/update/' + target
                var data = $.Deferred();
                $.ajax({
                    type: 'POST',
                    contentType: 'application/json; charset=utf-8',
                    url: url,
                    data: JSON.stringify({data: item}),
                    dataType: 'json'
                }).done(function(res){
                    if(res.status == 'success')
                        data.resolve(item);
                    else {
                        alert('error: '+res.status)
                        location.reload()
                    }
                });
                return data.promise();
            },
            deleteItem: function(item) {
                var url = '/admin/delete/'+ target
                var data = $.Deferred();
                $.ajax({
                    type: 'POST',
                    contentType: 'application/json; charset=utf-8',
                    url: url,
                    data: JSON.stringify({data: item}),
                    dataType: 'json'
                }).done(function(res){
                    if(res.status == 'success')
                        data.resolve(item);
                    else {
                        alert('error: '+res.status)
                        location.reload()
                    }
                });
                return data.promise();
            },
            insertItem: function(item) {
                var url = '/admin/add/' + target
                var data = $.Deferred();
                $.ajax({
                    type: 'POST',
                    contentType: 'application/json; charset=utf-8',
                    url: url,
                    data: JSON.stringify({data: item}),
                    dataType: 'json'
                }).done(function(res){
                    if(res.status == 'success')
                        data.resolve(res.data);
                    else {
                        alert('error: '+res.status)
                        location.reload()
                    }
                });
                return data.promise();
            }
        },

        fields: customerField
    }
    $('#target').on('change', function() {
        target = $.trim($(this).find('option:selected').text().toLowerCase());
        gridOption.fields = target === 'customer' ? customerField : clientField;
        $('#table').jsGrid(gridOption);
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



    $("#table").jsGrid(gridOption);



    function fetchData(url, method, data, callback) {

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
