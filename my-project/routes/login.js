var express = require('express');
var router = express.Router();


router.route('/password')
  .get(loginController.authenticate)