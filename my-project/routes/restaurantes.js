var express = require('express');
var router = express.Router();
var restauranteController = require('../controllers/restauranteController')


/* home restuarate */
router.route('/')
  .get(function(req, res, next) {
    res.render('restaurantes/restaurantesHome', { path: 'restaurantes'})
  })
  
  router.route('/add')
    .get(restauranteController.restaurante_create_get)
    .post(restauranteController.restaurante_create_post)

  router.route('/show')
    .get(restauranteController.restaurante_list)

  router.route('/show/:restauranteId')
    .get(restauranteController.restaurante_detail)

  router.route('/show/:restauranteId/addProduct')
    .get(restauranteController.add_product) 
    .post(restauranteController.add_product_post)

  router.route('/agregado')
    .get(restauranteController.restauranteAdded)

module.exports = router;
