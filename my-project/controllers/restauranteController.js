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
    res.render('restaurantes/addRestaurante')
  });
  
  // Handle Restaurante create on POST.
exports.restaurante_create_post = asyncHandler(async (req, res, next) => {
    // Create a genre object with escaped and trimmed data.
    const restaurante = new restauranteModel({ nombre: req.body.nombre, calle: req.body.calle, numero: req.body.numero });
    // Check if Genre with same name already exists.
      const restauranteExists = await restauranteModel.findOne({ nombre: req.body.name }).exec();
      if (restauranteExists) {
        // Genre exists, redirect to its detail page.
        res.send('EEROR al agregar restaurante');
      } else {
        await restaurante.save();
        // New genre saved. Redirect to genre detail page.
        res.redirect('/restaurantes');
      }
    });

exports.restaurante_detail = asyncHandler(async (req, res, nect) => {
  const restaurante = await restauranteModel.findById(req.params.restauranteId).lean()
  console.log(restaurante)
  const nombreRestaurante = restaurante.nombre

  res.render('restaurantes/restauranteDetail', {nombre: nombreRestaurante, datos: restaurante})
  });