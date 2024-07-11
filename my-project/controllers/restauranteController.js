const asyncHandler = require('express-async-handler')
const restauranteModel = require('../models/restaurante')
const usuarioModel = require('../models/usuario')
const {productoModel, tiposProductos} = require('../models/producto')
const { unlink } = require('node:fs/promises')
const nodemailer = require('nodemailer');
const multer = require('multer')
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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
  let template
  if (req.headers['hx-request']) {
    template = 'restaurantes/htmxListRestaurante'
  } else {
    template = 'restaurantes/listRestaurantes'
  }
  res.render(template, { sidebar: await sidebarHelper.sidebarRestaurantes(baseURL,"true") })
})

// ACTUALIZADO
exports.restaurante_create_get = asyncHandler(async (req, res, next) => {
  let template
  const parametros = {title: 'pene'} //??????????????????

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
  const { nombre, ciudad, calle, numero } = req.body

  if (!nombre || !ciudad || !calle || !numero) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  const restaurante = new restauranteModel({ nombre: req.body.nombre, ciudad: ciudad, calle: req.body.calle, numero: req.body.numero })

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
    const productos = await productoModel.find({ restauranteID: restaurante._id }).lean();
    let template
    const parametros = { 
      sidebar: await sidebarHelper.sidebarRestaurantes(baseURL,"true"),
      baseURL, title: 'Lista de restaurantes',datos: restaurante,productos } //creo que nombre y la lista no son necesarios
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
  let template
  const parametros = { baseURL,restauranteId, datos: restaurante, tiposProductos}

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
    const existeProduct = await productoModel.findOne({ nombre: req.body.nombreProducto, restauranteID: restaurante._id })

    if (existeProduct) {
      res.status(400).send('ERROR: El producto ya existe en este restaurante')
    } else {
      const nuevoProducto = new productoModel({
        nombre: req.body.nombreProducto,
        descripcion: req.body.descripcion,
        precio: req.body.precio,
        fecha_caducidad: req.body.fecha_caducidad,
        stock: req.body.stock,
        tipoProducto: req.body.tipoProducto,
        imagenesProducto: req.files.map(file => ({ id: file.filename })),
        restauranteID: restaurante._id
      });

      await nuevoProducto.save()

      //Envia mensaje por mail, (Nodemailer)

      const usuarios = await usuarioModel.find().select('email').exec();
      const correos = usuarios.map(usuario => usuario.email);

      const mailOptions = {
        from: `"NoWaste" <${process.env.EMAIL_USER}>`,
        to: correos,
        subject: 'Nuevo Producto Añadido!',
        text: `${restaurante.nombre} ha añadido: ${nuevoProducto.nombre} a $${nuevoProducto.precio}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.log(error);
        }
        console.log('Email enviado: ' + info.response);
      });


      res.redirect(`${baseURL}/show/${restaurante._id}`)
    }
  } else {
    res.send('ERROR al agregar restaurante')
  }
})

exports.edit_product = asyncHandler(async (req, res, next) => {
  const {restauranteId, productoId} = req.params;
  const restaurante = await restauranteModel.findById(restauranteId).lean();

  if (!restaurante) {
    res.status(404).send('Restaurante no encontrado');
  }

  const producto = await productoModel.findById(productoId).lean();

  if (!producto) {
    res.send('ERROR: Producto no encontrado')
  }

  let template
  const parametros = { baseURL, restauranteId,productoId ,producto}

  if (req.headers['hx-request']) {
    template = 'restaurantes/htmxEditProduct'
  } else {
    res.redirect(`${baseURL}/show/${restauranteId}`)
  }

  res.render(template, parametros)
})

exports.edit_product_post = asyncHandler(async (req, res, next) => {
  const {productoId, restauranteId} = req.params;
  const { nombre, descripcion, precio, fecha_caducidad, stock } = req.body;
  // Verificar si ya existe un producto con el mismo nombre y restauranteID
  const existeProducto = await productoModel.findOne({ nombre: nombre, restauranteID: restauranteId }).exec();

  if (existeProducto && existeProducto._id.toString() !== productoId) {
    console.log(existeProducto._id.toString())
    console.log(productoId)
    res.status(400).send('ERROR: Ya existe otro producto con ese nombre en este restaurante');
  }

  const producto = await productoModel.findById(productoId).exec();

  // Actualizar los datos del producto
  if (producto) {
    producto.nombre = nombre;
    producto.descripcion = descripcion;
    producto.precio = precio;
    producto.fecha_caducidad = fecha_caducidad;
    producto.stock = stock;

    await producto.save();
    res.redirect(`${baseURL}/show/${restauranteId}`);
  } else {
    res.status(404).send('ERROR: Producto no encontrado');
  }
})

exports.delete_producto = asyncHandler(async (req, res, next) => {
  const productoId = req.params.productoId; // Obtener el ID del producto desde los parámetros de la solicitud

  // Buscar el producto por su ID
  const producto = await productoModel.findById(productoId).exec();

  if (!producto) {
    res.status(404).send('Producto no encontrado');
  }

  // Eliminar las imágenes asociadas al producto
  for (const imagen of producto.imagenesProducto) {
    try {
      await unlink(`./public/images/${imagen.id}`);
      console.log(`Imagen ${imagen.id} eliminada exitosamente.`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.error(`La imagen con id ${imagen.id} no se encontró.`);
      } else {
        console.error(`Error al intentar eliminar la imagen: ${error.message}`);
      }
    }
  }

  // Eliminar el producto de la base de datos
  await productoModel.deleteOne({ _id: producto._id }).exec();

  res.status(200).send('Producto eliminado correctamente.');
})

exports.restaurante_delete = asyncHandler(async (req, res, next) => {
  const restauranteId = req.params.restauranteId;
  const restaurante = await restauranteModel.findById(restauranteId).lean()

  if (!restaurante) {
    res.status(404).send('Restaurante no encontrado');
  }

  const productos = await productoModel.find({restauranteId}).lean()
  for (const producto of productos) {
    try {
      // Eliminar las imágenes del producto
      for (const imagen of producto.imagenesProducto) {
        try {
          await unlink(`./public/images/${imagen.id}`);
          console.log(`Imagen ${imagen.id} eliminada exitosamente.`);
        } catch (error) {
          if (error.code === 'ENOENT') {
            console.error(`La imagen con id ${imagen.id} no se encontró.`);
          } else {
            console.error(`Error al intentar eliminar la imagen: ${error.message}`);
          }
        }
      }

      // Eliminar el producto de la base de datos
      await productoModel.deleteOne({ _id: producto._id }).exec();
      console.log(`Producto con ID ${producto._id} eliminado de la base de datos.`);

    } catch (error) {
      console.error(`Error al procesar el producto con ID ${producto._id}: ${error.message}`);
    }
  }

  const response = await restauranteModel.deleteOne({ _id: restauranteId }).exec()

  const urlActual = req.get('HX-Current-URL')

  const partesURL = urlActual.split('/')
  const restauranteIdURL = partesURL[partesURL.length - 1]

  if (restauranteId === restauranteIdURL) {
    res.status(200).send()
  } else {
    res.status(200).send()
  }
})
