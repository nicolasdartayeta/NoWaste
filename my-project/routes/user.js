var express = require('express');
var router = express.Router();

var userController = require('../controllers/userController');
const baseURL = '/user'
const isAuthenticated = require('../helpers/session');

//middleware para la sesion
router.use(isAuthenticated);

/* home users */
router.route('/')
  .get(userController.home)
  .post(userController.busqueda)

router.route('/show/:restauranteId')
  .get(userController.restaurante_list)

router.route('/listadoProductos')
  .get(userController.listado_productos)

router.route('/compra/:restauranteId/:productoId')
  .post(userController.comprar_producto)
  
module.exports = router;