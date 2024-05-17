const Author = require("../models/restaurante");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const restauranteModel = require('../models/restaurante');
const { Model } = require("mongoose");
const { title } = require("process");

// Display list of all restaurantes.
exports.restaurante_list = asyncHandler(async (req, res, next) => {
    const restaurantes = await restauranteModel.find().exec();

    res.render('restaurantes/listRestaurantes', {title: 'Lista de restaurantes', restaurantesList: restaurantes})
  });

// Display Restaurante create form on GET.
exports.restaurante_create_get = asyncHandler(async (req, res, next) => {
  // Si la request es de HTMX devuelve solo el cachito de HTML correspondiente al form para agregar un restaurante
  // Si la request no es de HTMX carga la pagina home de restaurantes, con la form para agregar un restaurante
  // en el bloque content.
  if (req.headers['hx-request']) {
    res.render('restaurantes/addRestaurante')
  } else {
    res.render('restaurantes/restaurantesHome', { action: 'add', path: 'restaurantes'})
  }
});

exports.restauranteAdded = asyncHandler(async (req, res, next) => {
  res.render('restaurantes/restauranteAgregado')
});
  
  // Handle Restaurante create on POST.
exports.restaurante_create_post = asyncHandler(async (req, res, next) => {
    // Create a genre object with escaped and trimmed data.
    const restaurante = new restauranteModel({ nombre: req.body.nombre, calle: req.body.calle, numero: req.body.numero });
    // Check if Genre with same name already exists.
      const restauranteExists = await restauranteModel.findOne({ nombre: req.body.name }).exec();
      if (restauranteExists) {
        // Genre exists, redirect to its detail page.
        res.send('ERROR al agregar restaurante');
      } else {
        await restaurante.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect('/restaurantes');
      }
    });

exports.restaurante_detail = asyncHandler(async (req, res, nect) => {
  const restaurante = await restauranteModel.findById(req.params.restauranteId).lean()
  const nombreRestaurante = restaurante.nombre

  // Si la request es de HTMX devuelve solo el cachito de HTML con el detalle del restaurante pedido
  // Si la request NO es de HTMX devuelve la pagina con el sidebar con la lista de restaurantes,
  // y el restaurante solicitado en content.
  if (req.headers['hx-request']) {
    res.render('restaurantes/restauranteDetail', {nombre: nombreRestaurante, datos: restaurante})
  } else {
    const restaurantes = await restauranteModel.find().exec();

    res.render('restaurantes/listRestaurantes', {action: 'detail', title: 'Lista de restaurantes', restaurantesList: restaurantes, nombre: nombreRestaurante, datos: restaurante})
  }
  });

exports.add_product = asyncHandler(async (req, res, next) => {
  const restauranteId = req.params.restauranteId
  const restaurante = await restauranteModel.findById(restauranteId).lean()
  console.log(restaurante)
  const nombreRestaurante = restaurante.nombre
  
  res.render('restaurantes/addProduct', {nombre: nombreRestaurante, restauranteId: restauranteId, datos: restaurante})
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
      res.redirect('/restaurantes');
    }
  } else {
    res.send('ERROR al agregar restaurante');
  }
  });

exports.restaurante_delete = asyncHandler(async (req, res, next) => {
  const response = await restauranteModel.deleteOne({_id: req.params.restauranteId}).exec()
  res.send()
});
