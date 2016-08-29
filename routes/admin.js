/**
 * Created by zhoucheng on 8/29/16.
 */

var express = require('express');
var router = express.Router();
var admin = require('../public/serverjs/admin');


router.get('/', function(req, res, next) {
    res.render('admin', { title: 'Admin', types: ['LIST', 'ADD', 'UPDATE', 'DELETE'], targets: ['CUSTOMER', 'CRAWLER'] });

});

router.get('/login', function(req, res, next) {
    if(req.session.user) {
        return res.redirect('/');
    } else {
        res.render('login', { title: 'Log In' });
    }
});

router.post('/login', function(req, res, next) {
    admin.login(req.body.username, req.body.password, function(err, data) {
        if(err || data.status == 0) {
            res.status(200).send({status: 0})
        } else {
            req.session.user = req.body.username;
            req.session.save()
            res.status(200).send({status: 1})
        }
    })
})

router.post('/logout', function(req, res, next) {
    req.session.destroy()
    res.status(200).send({status: 1})
})

router.get('/list/:target', function(req, res, next) {
    admin.list(req.params.target, function(err, data) {
        if(err)
            res.status(200).send({status: err})
        else
            res.status(200).send(data)
    })
})
module.exports = router;
