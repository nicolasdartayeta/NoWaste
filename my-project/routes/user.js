var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController');
const baseURL = '/user'

/* home users */
router.route('/')
  .get(userController.home)
  .post(userController.busqueda)

router.route('/show/:restauranteId')
  .get(userController.restaurante_list)

module.exports = router;