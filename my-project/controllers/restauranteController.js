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

exports.imageUploader = multer({ storage: storage})

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
  
  if (restaurante) {
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
  } else {
    res.redirect('/restaurantes/show')
  }
});

// ACTUALIZADO
exports.add_product = asyncHandler(async (req, res, next) => {
  const restauranteId = req.params.restauranteId
  const restaurante = await restauranteModel.findById(restauranteId).lean()
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
      const imagenes = req.files.map(file => ({id: file.filename}))
      const nuevoProducto = {
        nombre: req.body.nombreProducto,
        descripcion: req.body.descripcion,
        precio: req.body.precio,
        imagenesProducto: imagenes,
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

exports.edit_product = asyncHandler(async (req, res, next) => {
  const restauranteId = req.params.restauranteId
  const restaurante = await restauranteModel.findById(restauranteId).lean()
  const nombreRestaurante = restaurante.nombre
  const nombreProducto = req.query.nombreProducto
  const producto = restaurante.producto.find(producto => producto.nombre == nombreProducto)

  var template
  var parametros = {nombre: nombreRestaurante, restauranteId: restauranteId, datos: restaurante, producto: producto}

  if (req.headers['hx-request']) {
    template = 'restaurantes/htmxEditProduct'
  } else {
    res.redirect(`/restaurantes/show/${restauranteId}`)
  }
  
  res.render(template, parametros)
});

exports.edit_product_post = asyncHandler(async (req, res, next) => {
  const restaurante = await restauranteModel.findById(req.body.id).exec();

  if (restaurante) {
    const productoIndex = restaurante.producto.findIndex(producto => producto.nombre == req.body.nombreAnterior);
    // Actualizar los datos del producto
    restaurante.producto[productoIndex].nombre = req.body.nombreProducto;
    restaurante.producto[productoIndex].descripcion = req.body.descripcion;
    restaurante.producto[productoIndex].precio = req.body.precio;

    await restaurante.save();
    res.redirect(`/restaurantes/show/${req.body.id}`);
  } else {
    res.send('ERROR al agregar restaurante');
  }
});

exports.delete_producto = asyncHandler(async (req, res, next) => {
  const restaurante = await restauranteModel.findById(req.params.restauranteId).exec();
  console.log(req.params.nombreProducto);
  const productoIndex = restaurante.producto.findIndex(producto => producto.nombre == req.params.nombreProducto);
  console.log(productoIndex);
  for (imagen of restaurante.producto[productoIndex].imagenesProducto){
    try {
        console.log(imagen.id);
        await unlink(`./public/images/${imagen.id}`);
        console.log(`Imagen ${imagenId} eliminada exitosamente.`);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.error(`La imagen con id ${imagen.id} no se encontró.`);
        } else {
            console.error(`Error al intentar eliminar la imagen: ${error.message}`);
        }
    } //TRY AND CATCH
  }
  // Elimina el producto del arreglo producto del restaurante
  restaurante.producto.splice(productoIndex, 1);
  // Guarda los cambios en la base de datos
  try{
    await restaurante.save();
  } catch(error){
    console.error(error);
  };
  res.status(200).send();
});


exports.restaurante_delete = asyncHandler(async (req, res, next) => {
  const restaurante = await restauranteModel.findById(req.params.restauranteId).lean()
  for (producto of restaurante.producto) {
    for (imagen of producto.imagenesProducto){
      try {
          await unlink(`./public/images/${imagenId}`);
          console.log(`Imagen ${imagenId} eliminada exitosamente.`);
      } catch (error) {
          if (error.code === 'ENOENT') {
              console.error(`La imagen con id ${imagenId} no se encontró.`);
          } else {
              console.error(`Error al intentar eliminar la imagen: ${error.message}`);
          }
      } //TRY AND CATCH
    }
  };

<<<<<<< HEAD
  const response = await restauranteModel.deleteOne({_id: req.params.restauranteId}).exec()
  res.send()
=======
  const response = await restauranteModel.deleteOne({_id: req.params.restauranteId}).exec();
  res.send();
>>>>>>> 33cf0742a1ba2c55c971046d5fa9141e3ab2ea02
});
