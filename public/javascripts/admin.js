$(document).ready(function() {


    var target = 'customer'


    var customerField = [
        { name: "id", type: "text", width: 50, editing: false, validate: 'required'},
        { name: "verifyCode", type:"text", width: 70, validate: 'required' },
        { name: "email", type: "text", width: 70, validate: function(value) { return (value.split('@')).length === 2 } },
        { name: 'lastActive', type: 'text', width: 60, editing: false, inserting: false },
        { name: "createdAt", type: 'text', width: 60, editing: false, inserting: false},
        { type: "control" }
    ];

    var clientField = [
        { name: "id", type: "text", width: 50, editing: false, validate: 'required'},
        { name: "password", type:"text", width: 70, validate: 'required' },
        { name: "email", type: "text", width: 70, validate: function(value) { return (value.split('@')).length === 2 } },
        { name: 'successCount', type: 'number', width: 20, title: 'S', editing: false, inserting: false },
        { name: 'failCount', type: 'number', width: 20, title: 'F', editing: false, inserting: false },
        { name: 'lastActive', type: 'text', width: 60, editing: false, inserting: false },
        { name: "createdAt", type: 'text', width: 60, editing: false, inserting: false },
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

    $('#customer').on('click', function() {
        target = 'customer'
        gridOption.fields = customerField;
        $(this).css('font-weight', 500);
        $('#client').css('font-weight', 300)
        $('#table').jsGrid(gridOption);
    })


    $('#client').on('click', function() {
        target = 'client'
        gridOption.fields = clientField
        $(this).css('font-weight', 500);
        $('#customer').css('font-weight', 300)
        $('#table').jsGrid(gridOption);
    })



    $("#table").jsGrid(gridOption);



})
