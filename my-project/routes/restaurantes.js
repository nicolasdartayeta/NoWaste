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

module.exports = router;
