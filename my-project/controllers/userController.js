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
  res.appendHeader('HX-Redirect', '/user')
  const ip = String(req.connection.remoteAddress)
  try{
    if (!ip.startsWith('::ffff:')){         //condicion debido a tener hosteado en el docker local
      data = await obtenerCiudad('ip')
      req.session.city = data.city}
    else{ req.session.city = 'Tandil'}

    const restaurantes = await restauranteModel.find().exec()
    let template
    if (req.headers['hx-request']) {
      template = 'restaurantes/htmxListRestaurante'
    } else {
      template = 'usuarios/usuariosHome'
    }
    res.render(template, { sidebar: await sidebarHelper.sidebarRestaurantes(baseURL), baseURL, title: 'Lista de restaurantes', restaurantesList: restaurantes, ciudad: req.session.city})
  }catch (error) {
    if (req.headers['hx-request']) {
      template = 'restaurantes/htmxListRestaurante'
    } else {
      template = 'usuarios/usuariosHome'
    }
    res.render(template, { sidebar: await sidebarHelper.sidebarRestaurantes(baseURL), baseURL, title: 'Lista de restaurantes', restaurantesList: restaurantes, ciudad: 'Tandil'})
  }
})

exports.busqueda = asyncHandler(async (req, res, next) => {
  const restaurantes = await restauranteModel.find({ nombre: { $regex: req.body.search, $options: 'i' } }).exec()
  const sidebar = new sidebarHelper.Sidebar('Lista de comercios')

  for (const restaurante of restaurantes) {
    console.log(restaurante)
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


function obtenerCiudad(ip) {
  return new Promise((resolve, reject) => {
    // Opciones de la solicitud, construyendo la URL con la IP
    const options = {
      hostname: 'ip-api.com',
      port: 80,
      path: `/json/190.246.97.123`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve(parsedData);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}