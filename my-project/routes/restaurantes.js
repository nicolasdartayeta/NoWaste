var express = require('express');
var router = express.Router();

var restauranteController = require('../controllers/restauranteController');
const baseURL = '/admin/restaurantes'
const isAuthenticated = require('../helpers/session');
const isSuperAdmin = require('../helpers/isSuperAdmin')

//middleware para la sesion
router.use(isAuthenticated);
router.use(isSuperAdmin)

/* home restuarate */
router.route('/')
  .get(restauranteController.restaurante_home_get)

router.route('/add')
  .get(restauranteController.restaurante_create_get)
  .post(restauranteController.restaurante_create_post)

router.route('/show')
  .get(restauranteController.restaurante_list)

router.route('/show/:restauranteId')
  .get(restauranteController.restaurante_detail)
  .delete(restauranteController.restaurante_delete)

router.route('/:restauranteId/addProduct')
  .get(restauranteController.add_product) 
  .post(restauranteController.imageUploader.array('imagenProducto'), restauranteController.add_product_post)

router.route('/:restauranteId/editProduct')
  .get(restauranteController.edit_product) 
  .post(restauranteController.edit_product_post)

router.route('/:restauranteId/deleteProduct/:nombreProducto') 
  .delete(restauranteController.delete_producto)

module.exports = router;
