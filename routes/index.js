var express = require('express');
var router = express.Router();
var admin = require('../public/serverjs/admin');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Task Server', methods: ['GET', 'POST'] });
});



module.exports = router;
