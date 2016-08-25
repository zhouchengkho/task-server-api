var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Task Server', methods: ['GET', 'POST'] });
});


router.get('/test', function(req, res) {
    res.send({a:'b'});
})
module.exports = router;
