var express = require('express');
var router = express.Router();

/* home page. */
router.route('/')
  .get(function(req, res, next) {
    res.render('index', { title: 'NoWaste' });
  })

module.exports = router;
