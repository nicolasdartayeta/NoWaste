const asyncHandler = require('express-async-handler')
const restauranteModel = require('../models/restaurante')
const { unlink } = require('node:fs/promises')
const http = require('http')
const multer = require('multer')
const sidebarHelper = require('../helpers/sidebar.js')

const storage = multer.diskStorage({
  destination: function (req, file, cb) { // CHECK SI ESTA LA CARPETA O NO
    cb(null, './public/images')
  },

  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.jpg')
  }
})

const baseURL = '/user'

exports.imageUploader = multer({ storage })

exports.home = asyncHandler(async (req, res, next) => {
  const { lat, lng } = req.query
  let template
  if (lat && lng) {
    data = await obtenerCiudadl(lat, lng).then()
    req.session.lat=lat;
    req.session.long=lng;
    req.session.city = data
    console.log('Location received:',req.session.city)
  }
  if ( req.session.lat & req.session.long) {
    res.appendHeader('HX-Redirect', '/user')
    console.log('Location received:', req.session.lat, req.session.long)
    if (req.headers['hx-request']) {
      template = 'restaurantes/htmxListRestaurante'
    } else {
      template = 'usuarios/usuariosHome'
    }
    const restaurantes = await restauranteModel.find().exec()
    res.render(template, { sidebar: await sidebarHelper.sidebarRestaurantes(baseURL), baseURL, title: 'Lista de restaurantes', restaurantesList: restaurantes, ciudad: req.session.city})
  }else{
    res.appendHeader('HX-Redirect', '/user/mapa')
    res.render('usuarios/mapa')
  }
})

exports.busqueda = asyncHandler(async (req, res, next) => {
  const restaurantes = await restauranteModel.find({ nombre: { $regex: req.body.search, $options: 'i' } }).exec()
  const sidebar = new sidebarHelper.Sidebar('Lista de comercios')

  for (const restaurante of restaurantes) {
    sidebar.addItem(restaurante.nombre, `/user/show/${restaurante._id}`, '#content')
  }
  res.render('restaurantes/htmxListRestaurante', {sidebar: sidebar.sidebar})
})

exports.restaurante_list = asyncHandler(async (req, res, next) => {
  const restaurante = await restauranteModel.findById(req.params.restauranteId).lean()

  if (restaurante) {
    const nombreRestaurante = restaurante.nombre
    const restaurantes = await restauranteModel.find().exec()
    let template
    const parametros = { sidebar: await sidebarHelper.sidebarRestaurantes(baseURL), baseURL, title: 'Lista de restaurantes', restaurantesList: restaurantes, nombre: nombreRestaurante, datos: restaurante }
    if (req.headers['hx-request']) {
      template = 'restaurantes/htmxRestauranteDetail'
    } else {
      template = 'usuarios/usuariosHome'
    }

    res.render(template, parametros)
  } else {
    res.redirect(baseURL + '/show')
  }
})

exports.listado_productos = asyncHandler(async (req, res, next) => {
  const restaurantes = await restauranteModel.find().exec()
  let template
  if (req.headers['hx-request']) {
    template = 'usuarios/htmxListProductos'
  } else {
    template = 'usuarios/usuariosHome'// ERROR
  }
  res.render(template, { baseURL, restaurantesList: restaurantes, ciudad: req.session.city })
})

exports.comprar_producto = asyncHandler(async (req, res, next) => {
  const restaurante = await restauranteModel.findById(req.params.restauranteId)
  if (restaurante){
    const producto = await restaurante.producto.id(req.params.productoId)   //busca el produto con el metodo .id()
    if (producto){ 
      if (producto.stock === 0 || producto.stock === null){
        res.status(400).send('El producto esta fuera de stock')
      }
      const cantidadCompra = parseInt(req.body.cantidad)
      if (cantidadCompra <= 0 || cantidadCompra > producto.stock) {
        return res.status(400).send('Cantidad inválida o supera el stock disponible');
      }
      producto.stock -= cantidadCompra;
      await restaurante.save()
      res.redirect(`/user`)       //luego al implementar el pago y demas cambiar esto
    }else{
      res.status(404).send('Producto no encontrado')
    }
  }else{
    res.status(404).send('Restaurante no encontrado')
  }
})

exports.mapa = asyncHandler(async (req, res, next) => {
  res.appendHeader('HX-Redirect', '/user/mapa')
  let template
  if (req.headers['hx-request']) {
    template = 'usuarios/mapa'
  } else {
    template = 'usuarios/mapa'// ERROR
  }
  res.render(template)
})

function obtenerCiudadl(lat,lng) {
    let key = process.env.APIKEY_LOCATIONIQ;
    const apiUrl = `https://us1.locationiq.com/v1/reverse?key=${key}&lat=${lat}&lon=${lng}&format=json&`;
    const options = {method: 'GET', headers: {accept: 'application/json'}};

    
    return new Promise((resolve, reject) => {
      fetch(apiUrl, options)
        .then(response => response.json())
        .then(data => {
          if (data && data.address && data.address.city) {
            resolve(data.address.city);
          } else {
            reject('No se pudo obtener la ciudad de la respuesta.');
          }
        })
        .catch(err => reject(err));
    });
}