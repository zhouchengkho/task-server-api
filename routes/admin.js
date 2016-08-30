/**
 * Created by zhoucheng on 8/29/16.
 */

var express = require('express');
var router = express.Router();
var admin = require('../serverjs/admin');


router.get('/', function(req, res) {
    res.render('admin', { title: 'Admin', types: ['LIST', 'FIND', 'ADD', 'UPDATE', 'DELETE'], targets: ['CUSTOMER', 'CRAWLER'] });

});

router.get('/login', function(req, res) {
    if(req.session.user) {
        return res.redirect('/');
    } else {
        res.render('login', { title: 'Log In' });
    }
});

router.post('/login', function(req, res) {
    admin.login(req.body.username, req.body.password, function(err, data) {
        if(err || data == 0) {
            res.status(200).send({status: 0})
        } else {
            req.session.user = req.body.username;
            req.session.save()
            res.status(200).send({status: 1})
        }
    })
})

router.post('/logout', function(req, res) {
    req.session.destroy()
    res.status(200).send({status: 1})
})

router.get('/list/:target', function(req, res) {
    admin.list(req.params.target, function(err, data) {
        if(err)
            res.status(200).send({status: err})
        else
            res.status(200).send(data)
    })
})

router.get('/find/:target', function(req, res) {
    admin.find(req.params.target, req.query.username, function(err, data) {
        if(err)
            res.status(200).send({status: err})
        else
            res.status(200).send(data)
    })
})

router.post('/update/:target', function(req, res) {
    admin.update(req.params.target, req.body, function(err, data) {
        if(err)
            res.status(200).send({status: err})
        else
            res.status(200).send(data)
    })
})

router.post('/delete/:target', function(req, res) {
    admin.delete(req.params.target, req.body, function(err, data) {
        if(err)
            res.status(200).send({status: err})
        else
            res.status(200).send(data)
    })
})

router.post('/add/:target', function(req, res) {
    admin.add(req.params.target, req.body, function(err, data) {
        if(err)
            res.status(200).send({status: err})
        else
            res.status(200).send(data)
    })

})
module.exports = router;
