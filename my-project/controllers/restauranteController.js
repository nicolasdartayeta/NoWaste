const asyncHandler = require("express-async-handler");
const restauranteModel = require('../models/restaurante');

// ACTUALIZADO
exports.restaurante_list = asyncHandler(async (req, res, next) => {
    const restaurantes = await restauranteModel.find().exec();

    var template
    if (req.headers['hx-request']) {
      template = 'restaurantes/htmxListRestaurante'
    } else {
      template = 'restaurantes/listRestaurantes'
    }  
    res.render(template, {title: 'Lista de restaurantes', restaurantesList: restaurantes})
  });

// ACTUALIZADO
exports.restaurante_create_get = asyncHandler(async (req, res, next) => {
  var template
  var parametros = {}

  if (req.headers['hx-request']) {
    template = 'restaurantes/htmxAddRestaurante'
  } else {
    template = 'restaurantes/restaurantesHome'
    parametros['action'] = 'add'
  }

  res.render(template, parametros)
});
  
// Handle Restaurante create on POST.
exports.restaurante_create_post = asyncHandler(async (req, res, next) => {
  // Create a genre object with escaped and trimmed data.
  const restaurante = new restauranteModel({ nombre: req.body.nombre, calle: req.body.calle, numero: req.body.numero });
  // Check if Genre with same name already exists.
    const restauranteExists = await restauranteModel.findOne({ nombre: req.body.name }).exec();
    if (restauranteExists) {
      // Restaurante exists, redirect to its detail page.
      res.send('ERROR al agregar restaurante');
    } else {
      await restaurante.save();
      // New restaurante saved. Redirect to genre detail page.
      res.render('restaurantes/restauranteAgregado');
    }
 });

 // ACTUALIZADO
exports.restaurante_detail = asyncHandler(async (req, res, nect) => {
  const restaurante = await restauranteModel.findById(req.params.restauranteId).lean()
  const nombreRestaurante = restaurante.nombre
  const restaurantes = await restauranteModel.find().exec();

  var template
  var parametros = { title: 'Lista de restaurantes', restaurantesList: restaurantes, nombre: nombreRestaurante, datos: restaurante}
  if (req.headers['hx-request']) {
    template = 'restaurantes/htmxRestauranteDetail'
  } else {
    template = 'restaurantes/restauranteDetail'
  }

  res.render(template, parametros)
});

// ACTUALIZADO
exports.add_product = asyncHandler(async (req, res, next) => {
  const restauranteId = req.params.restauranteId
  const restaurante = await restauranteModel.findById(restauranteId).lean()
  console.log(restaurante)
  const nombreRestaurante = restaurante.nombre

  var template
  var parametros = {nombre: nombreRestaurante, restauranteId: restauranteId, datos: restaurante}

  if (req.headers['hx-request']) {
    template = 'restaurantes/htmxAddProduct'
  } else {
    res.redirect(`/restaurantes/show/${restauranteId}`)
  }
  
  res.render(template, parametros)
});

exports.add_product_post = asyncHandler(async (req, res, next) => {
  const restaurante = await restauranteModel.findById(req.body.id).exec();
  
  if (restaurante) {
    const existeProduct = restaurante.producto.find(producto => producto.nombre === req.body.nombreProducto);

    if (existeProduct) {
      res.send('ERROR: El producto ya existe en este restaurante');
    } else {
      const nuevoProducto = {
        nombre: req.body.nombreProducto,
        descripcion: req.body.descripcion,
        precio: req.body.precio
      };
        
      // Añade el nuevo producto a la lista de productos del restaurante.
      restaurante.producto.push(nuevoProducto);
    
      // Guarda el restaurante actualizado en la base de datos.
      await restaurante.save();
      res.redirect(`/restaurantes/show/${req.body.id}`);
    }
  } else {
    res.send('ERROR al agregar restaurante');
  }
  });

exports.restaurante_delete = asyncHandler(async (req, res, next) => {
  const response = await restauranteModel.deleteOne({_id: req.params.restauranteId}).exec()
  res.send()
});
