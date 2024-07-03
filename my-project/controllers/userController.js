const asyncHandler = require('express-async-handler')
const restauranteModel = require('../models/restaurante')
const { unlink } = require('node:fs/promises')

const multer = require('multer')

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
  const restaurantes = await restauranteModel.find().exec()
  let template
  if (req.headers['hx-request']) {
    template = 'restaurantes/htmxListRestaurante'
  } else {
    template = 'usuarios/usuariosHome'
  }
  res.render(template, { baseURL, title: 'Lista de restaurantes', restaurantesList: restaurantes })
})

exports.busqueda = asyncHandler(async (req, res, next) => {
  const restaurantes = await restauranteModel.find({ nombre: { $regex: req.body.search, $options: 'i' } }).exec()
  console.log(req)
  res.render('restaurantes/htmxListRestaurante', { baseURL, title: 'Lista de restaurantes', restaurantesList: restaurantes })
})

exports.restaurante_list = asyncHandler(async (req, res, next) => {
  const restaurante = await restauranteModel.findById(req.params.restauranteId).lean()

  if (restaurante) {
    const nombreRestaurante = restaurante.nombre
    const restaurantes = await restauranteModel.find().exec()
    console.log('arobvl')
    let template
    const parametros = { baseURL, title: 'Lista de restaurantes', restaurantesList: restaurantes, nombre: nombreRestaurante, datos: restaurante }
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
  res.render(template, { baseURL, restaurantesList: restaurantes })
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
      console.log(req.body.cantidad)
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
