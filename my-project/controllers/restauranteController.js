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
const baseURL = '/admin/restaurantes'

exports.imageUploader = multer({ storage })

const sidebarHelper = require('../helpers/sidebar.js')

exports.restaurante_home_get = asyncHandler(async (req, res, next) => {
  const sidebar = new sidebarHelper.Sidebar('Menu resturantes')

  sidebar.addItem("Añadir restaurante", `${baseURL}/add`, `#content`)
  sidebar.addItem("Ver restaurantes", `${baseURL}/show`, `#sidebar`)

  let template

  if (req.headers['hx-request']) {
    template = 'componentes/sidebarContent'
  } else {
    template = 'restaurantes/restaurantesHome'
  }

  res.render(template, {sidebar: sidebar.sidebar})
})

// ACTUALIZADO
exports.restaurante_list = asyncHandler(async (req, res, next) => {
  // const restaurantes = await restauranteModel.find().exec()
  // const sidebar = new sidebarModel('Lista resturantes')
  
  // restaurantes.forEach((restaurante) => sidebar.addItem(restaurante.nombre, `${baseURL}/show/${restaurante._id}`, "#content", restaurante._id.toString()))
  
  let template
  if (req.headers['hx-request']) {
    template = 'restaurantes/htmxListRestaurante'
  } else {
    template = 'restaurantes/listRestaurantes'
  }
  res.render(template, { sidebar: await sidebarHelper.sidebarRestaurantes(baseURL) })
  // res.render(template, { baseURL, title: 'Lista de restaurantes', restaurantesList: restaurantes })
})

// ACTUALIZADO
exports.restaurante_create_get = asyncHandler(async (req, res, next) => {
  let template
  const parametros = {}

  if (req.headers['hx-request']) {
    template = 'restaurantes/htmxAddRestaurante'
  } else {
    template = 'restaurantes/restaurantesHome'
    parametros.action = 'add'
  }
  parametros.baseURL = baseURL

  res.render(template, parametros)
})

// Handle Restaurante create on POST.
exports.restaurante_create_post = asyncHandler(async (req, res, next) => {
  const { nombre, calle, numero } = req.body

  if (!nombre || !calle || !numero) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  const restaurante = new restauranteModel({ nombre: req.body.nombre, calle: req.body.calle, numero: req.body.numero })

  const restauranteExists = await restauranteModel.findOne({ nombre: req.body.name }).exec()
  if (restauranteExists) {
    res.send('ERROR al agregar restaurante')
  } else {
    await restaurante.save()
    res.render('restaurantes/restauranteAgregado')
  }
})

// ACTUALIZADO
exports.restaurante_detail = asyncHandler(async (req, res, nect) => {
  const restaurante = await restauranteModel.findById(req.params.restauranteId).lean()

  if (restaurante) {
    const nombreRestaurante = restaurante.nombre
    const restaurantes = await restauranteModel.find().exec()

    let template
    const parametros = { 
      sidebar: await sidebarHelper.sidebarRestaurantes(baseURL),
      baseURL, title: 'Lista de restaurantes', restaurantesList: restaurantes, nombre: nombreRestaurante, datos: restaurante }
    if (req.headers['hx-request']) {
      template = 'restaurantes/htmxRestauranteDetail'
    } else {
      template = 'restaurantes/restauranteDetail'
    }

    res.render(template, parametros)
  } else {
    res.redirect(baseURL + '/show')
  }
})

// ACTUALIZADO
exports.add_product = asyncHandler(async (req, res, next) => {
  const restauranteId = req.params.restauranteId
  const restaurante = await restauranteModel.findById(restauranteId).lean()
  const nombreRestaurante = restaurante.nombre

  let template
  const parametros = { baseURL, nombre: nombreRestaurante, restauranteId, datos: restaurante }

  if (req.headers['hx-request']) {
    template = 'restaurantes/htmxAddProduct'
  } else {
    res.redirect(`${baseURL}/show/${restauranteId}`)
  }

  res.render(template, parametros)
})

exports.add_product_post = asyncHandler(async (req, res, next) => {
  const restaurante = await restauranteModel.findById(req.body.id).exec()

  if (restaurante) {
    const existeProduct = restaurante.producto.find(producto => producto.nombre === req.body.nombreProducto)

    if (existeProduct) {
      res.send('ERROR: El producto ya existe en este restaurante')
    } else {
      const imagenes = req.files.map(file => ({ id: file.filename }))
      const nuevoProducto = {
        nombre: req.body.nombreProducto,
        descripcion: req.body.descripcion,
        precio: req.body.precio,
        fecha_caducacion: req.body.fecha_caducacion,
        stock: req.body.stock,
        imagenesProducto: imagenes
      }

      // Añade el nuevo producto a la lista de productos del restaurante.
      restaurante.producto.push(nuevoProducto)

      // Guarda el restaurante actualizado en la base de datos.
      await restaurante.save()
      res.redirect(`${baseURL}/show/${req.body.id}`)
    }
  } else {
    res.send('ERROR al agregar restaurante')
  }
})

exports.edit_product = asyncHandler(async (req, res, next) => {
  const restauranteId = req.params.restauranteId
  const restaurante = await restauranteModel.findById(restauranteId).lean()
  const nombreRestaurante = restaurante.nombre
  const nombreProducto = req.query.nombreProducto
  const producto = restaurante.producto.find(producto => producto.nombre == nombreProducto)

  let template
  const parametros = { baseURL, nombre: nombreRestaurante, restauranteId, datos: restaurante, producto }

  if (req.headers['hx-request']) {
    template = 'restaurantes/htmxEditProduct'
  } else {
    res.redirect(`${baseURL}/show/${restauranteId}`)
  }

  res.render(template, parametros)
})

exports.edit_product_post = asyncHandler(async (req, res, next) => {
  const restaurante = await restauranteModel.findById(req.body.id).exec()

  if (restaurante) {
    const productoIndex = restaurante.producto.findIndex(producto => producto.nombre == req.body.nombreAnterior)
    // Actualizar los datos del producto
    restaurante.producto[productoIndex].nombre = req.body.nombreProducto
    restaurante.producto[productoIndex].descripcion = req.body.descripcion
    restaurante.producto[productoIndex].precio = req.body.precio
    restaurante.producto[productoIndex].fecha_caducacion = req.body.fecha_caducacion
    restaurante.producto[productoIndex].stock = req.body.stock


    await restaurante.save()
    res.redirect(`${baseURL}/show/${req.body.id}`)
  } else {
    res.send('ERROR al agregar restaurante')
  }
})

exports.delete_producto = asyncHandler(async (req, res, next) => {
  const restaurante = await restauranteModel.findById(req.params.restauranteId).exec()
  const productoIndex = restaurante.producto.findIndex(producto => producto.nombre == req.params.nombreProducto)

  for (imagen of restaurante.producto[productoIndex].imagenesProducto) {
    try {
      await unlink(`./public/images/${imagen.id}`)
      console.log(`Imagen ${imagenId} eliminada exitosamente.`)
      // res.redirect(`${baseURL}/show/${req.params.restauranteId}`)
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`La imagen con id ${imagen.id} no se encontró.`)
      } else {
        console.error(`Error al intentar eliminar la imagen: ${error.message}`)
      }
    }
  }
  // Elimina el producto del arreglo producto del restaurante
  restaurante.producto.splice(productoIndex, 1)
  // Guarda los cambios en la base de datos
  try {
    await restaurante.save()
  } catch (error) {
    console.error(error)
  };
  res.status(200).send()
})

exports.restaurante_delete = asyncHandler(async (req, res, next) => {
  const restaurante = await restauranteModel.findById(req.params.restauranteId).lean()
  for (producto of restaurante.producto) {
    for (imagen of producto.imagenesProducto) {
      try {
        await unlink(`./public/images/${imagenId}`)
        console.log(`Imagen ${imagenId} eliminada exitosamente.`)
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.error(`La imagen con id ${imagenId} no se encontró.`)
        } else {
          console.error(`Error al intentar eliminar la imagen: ${error.message}`)
        }
      } // TRY AND CATCH
    }
  };

  const response = await restauranteModel.deleteOne({ _id: req.params.restauranteId }).exec()

  const urlActual = req.get('HX-Current-URL')
  console.log('ju')

  const partesURL = urlActual.split('/')
  const restauranteIdURL = partesURL[partesURL.length - 1]

  if (req.params.restauranteId === restauranteIdURL) {
    res.status(200).send()
  } else {
    res.status(200).send()
  }
})
