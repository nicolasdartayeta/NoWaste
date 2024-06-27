const asyncHandler = require("express-async-handler");
const restauranteModel = require('../models/restaurante');
const { unlink } = require('node:fs/promises');

const multer  = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {         //CHECK SI ESTA LA CARPETA O NO
    cb(null, './public/images')
  },
  
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg')
  }
})

const baseURL = '/user'

exports.imageUploader = multer({ storage: storage})

exports.home = asyncHandler(async (req, res, next) => {
    const restaurantes = await restauranteModel.find().exec();
    var template
    if (req.headers['hx-request']) {
      template = 'restaurantes/htmxListRestaurante'
    } else {
      template = 'usuarios/usuariosHome'
    }  
    res.render(template, {baseURL: baseURL, title: 'Lista de restaurantes', restaurantesList: restaurantes})
  });

exports.busqueda = asyncHandler(async (req, res, next) => {
  const restaurantes = await restauranteModel.find({ "nombre":{$regex: req.body.search, $options: 'i' }}).exec();
  console.log(req)
  res.render('restaurantes/htmxListRestaurante', {baseURL: baseURL, title: 'Lista de restaurantes', restaurantesList: restaurantes})
});

exports.restaurante_list = asyncHandler(async (req, res, next) => {
  const restaurante = await restauranteModel.findById(req.params.restauranteId).lean()
  
  if (restaurante) {
    const nombreRestaurante = restaurante.nombre
    const restaurantes = await restauranteModel.find().exec();
    console.log("arobvl")
    var template
    var parametros = {baseURL: baseURL, title: 'Lista de restaurantes', restaurantesList: restaurantes, nombre: nombreRestaurante, datos: restaurante}
    if (req.headers['hx-request']) {
      template = 'restaurantes/htmxRestauranteDetail'
    } else {
      template = 'usuarios/usuariosHome'
    }
  
    res.render(template, parametros)
  } else {
    res.redirect(baseURL+'/show')
  }
});

/*
// ACTUALIZADO
exports.restaurante_list = asyncHandler(async (req, res, next) => {
    const restaurantes = await restauranteModel.find().exec();

    var template
    if (req.headers['hx-request']) {
      template = 'restaurantes/htmxListRestaurante'
    } else {
      template = 'restaurantes/listRestaurantes'
    }  
    res.render(template, {baseURL: '/admin/restaurantes', title: 'Lista de restaurantes', restaurantesList: restaurantes})
  });


 // ACTUALIZADO
exports.restaurante_detail = asyncHandler(async (req, res, nect) => {
  const restaurante = await restauranteModel.findById(req.params.restauranteId).lean()
  
  if (restaurante) {
    const nombreRestaurante = restaurante.nombre
    const restaurantes = await restauranteModel.find().exec();
  
    var template
    var parametros = {baseURL: '/admin/restaurantes', title: 'Lista de restaurantes', restaurantesList: restaurantes, nombre: nombreRestaurante, datos: restaurante}
    if (req.headers['hx-request']) {
      template = 'restaurantes/htmxRestauranteDetail'
    } else {
      template = 'restaurantes/restauranteDetail'
    }
  
    res.render(template, parametros)
  } else {
    res.redirect(baseURL+'/show')
  }
});
*/
