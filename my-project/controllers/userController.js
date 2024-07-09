const asyncHandler = require('express-async-handler')
const restauranteModel = require('../models/restaurante')
const productoModel = require('../models/producto')
const http = require('http')
const multer = require('multer')
const sidebarHelper = require('../helpers/sidebar.js')
const obtenerCiudadl = require('../helpers/obtenerCiudad.js')

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
  console.log(req.query)
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

    const productosConNombreRestaurante = await productoModel.aggregate([ //seria un join en mongoDB
      {
          $lookup: {
              from: 'restaurantes', // Nombre de la colección con la que se quiere hacer el join
              localField: 'restauranteID', //atributo de la colección de productos que se utiliza para el join
              foreignField: '_id', //atributo de la colección de restaurantes que se utiliza para el join
              as: 'restaurante' //nombre del campo en el resultado del join
          }
      },
      {
          $unwind: '$restaurante' // Deshacer el array resultante del lookup
      },
      {
          $project: { // seleccionar los campos que se quieren mostrar
              _id: 1,
              nombre: 1,
              descripcion: 1,
              precio: 1,
              stock: 1,
              imagenesProducto: 1,
              restauranteNombre: '$restaurante.nombre'
          }
      }]);
    
    if (req.headers['hx-request']) {
      template = 'restaurantes/htmxListRestaurante'
    } else {
      template = 'usuarios/usuariosHome'
    }
    res.render(template, { sidebar: await sidebarHelper.sidebarRestaurantes(baseURL), baseURL, title: 'Lista de restaurantes', productos: productosConNombreRestaurante, ciudad: req.session.city})
  }else{
    res.appendHeader('HX-Redirect', '/user/mapa')
    res.render('usuarios/mapa')
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
    const productos = await productoModel.find({ restauranteID: restaurante._id }).lean();
    let template
    const parametros = { sidebar: await sidebarHelper.sidebarRestaurantes(baseURL), baseURL, title: 'Lista de restaurantes', datos: restaurante, productos }
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

exports.listado_productos = asyncHandler(async (req, res, next) => { //CREO QUE NO SE USA, NI LA RUTA
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
  const producto = await productoModel.findById(req.params.productoId)   //busca el produto con el metodo .id()
  if (producto){ 
    if (producto.stock === 0 || producto.stock === null){
      res.status(400).send('El producto esta fuera de stock')
    }
    const cantidadCompra = parseInt(req.body.cantidad)
    if (cantidadCompra <= 0 || cantidadCompra > producto.stock) {
      return res.status(400).send('Cantidad inválida o supera el stock disponible');
    }
    producto.stock -= cantidadCompra;
    await producto.save()
    res.redirect(`/user`)       //luego al implementar el pago y demas cambiar esto
  }else{
    res.status(404).send('Producto no encontrado')
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