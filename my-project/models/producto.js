const mongoose = require('mongoose')

// Define a schema
const Schema = mongoose.Schema;

const productoSchema = new Schema({
    nombre: String,
    descripcion: String,
    precio: Number,
    fecha_caducidad: String,
    tipoProducto: String,
    stock: {
        type: Number,
        validate: {
        validator: Number.isInteger,
        message: '{VALUE} La cantidad debe ser un numero entero'
        }
    },
    imagenesProducto: [{
        id: String, 
    }],
    restauranteID:{
        type: Schema.Types.ObjectId,
        ref: "restaurante",
        required: true,
    },
})

const tiposProductos = ["Hamburguesa", "Tarta", "Milanesa", "Helado", "Pizza", "Sandwich", "Sopa", "Torta", "Pan", "Frutas", "Verduras", "Otros"]

  
  // Export function to create "Producto" model class
  module.exports.productoModel = mongoose.model("producto", productoSchema);
  module.exports.tiposProductos = tiposProductos;