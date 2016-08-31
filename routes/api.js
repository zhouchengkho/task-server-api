/**
 * Created by zhoucheng on 8/25/16.
 */
var express = require('express');
var router = express.Router();

var task = require('../serverjs/task');
var test = require('../serverjs/test');
var config = require('../serverjs/config');
var promise = require('bluebird');
promise.promisifyAll(task);


router.post('/requesttask', function(req, res) {
    console.log('request task');
    var key = 'task'
    var data = req.body
    task.distribute(key, data, function(err, data) {
        if(err) {
            res.status(200).send({status: 'request failed: '+err})
        } else {
            console.log(key+' distributed: '+JSON.stringify(data));
            res.status(200).send(data);
        }
    });
})

router.post('/requestscript', function(req,res) {
    console.log('request script');
    var key = 'script';
    var data = req.body

    task.distribute(key, data, function(err, data) {
        if(err) {
            res.status(200).send({status: 'request failed: '+err})
        } else {
            console.log(key+' distributed: '+JSON.stringify(data));
            res.status(200).send(data);
        }
    });
})

router.post('/requestboth', function(req,res) {
    console.log('request both');
    var key = 'both';
    var data = req.body

    task.distribute(key, data, function(err, data) {
        if(err) {
            res.status(200).send({status: 'request failed: '+err})
        } else {
            console.log(key+' distributed: '+JSON.stringify(data));
            res.status(200).send(data);
        }
    });
})

router.post('/report', function(req, res) {
    console.log('incoming report')
    var data = req.body;
    task.report(data, function(err) {
        if(err)
            res.status(200).send({status: 'request failed: '+err});
        else
            res.status(200).send({status: 'success'})
    });
})

router.post('/filltask', function(req, res) {
    console.log('fill task');
    task.fillTask(req.body, function(err) {
        if(err)
            res.status(200).send({status: err});
        else
            res.status(200).send({status: 'success'});
    })
})

router.post('/customerrequest', function(req, res) {
    console.log('customer pickup')
    task.getResult(req.body, function(err, data) {
        if(err) {
            res.status(200).send({status: 'request failed: '+err})
        } else {
            res.status(200).send(data)
        }
    })
})

router.get('/taskqueue', function(req, res) {
    task.getQueue(req.query, function(err, data) {
        if(err) {
            res.status(200).send({status: 'error: '+err})
        } else {
            res.status(200).send(data)
        }
    })

})
module.exports = router;
