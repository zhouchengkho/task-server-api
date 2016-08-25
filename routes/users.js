var express = require('express');
var router = express.Router();
//var task = require('../javascripts/task');
//var promise = require('bluebird');
//promise.promisifyAll(task);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


module.exports = router;
