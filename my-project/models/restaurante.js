const mongoose = require('mongoose')

// Define a schema
const Schema = mongoose.Schema;

const restauranteSchema = new Schema({
  nombre: String,
  calle: String,
  numero: Number,
  imagenRestaurante: String,
  producto: [{
                nombre: String,
                descripcion: String,
                precio: Number,
                fecha_caducidad: String,
                stock: {
                  type: Number,
                  validate: {
                    validator: Number.isInteger,
                    message: '{VALUE} La cantidad debe ser un numero entero'
                  }
                },
                imagenesProducto: [{
                  id: String, 
                }]
            }],
});

// Export function to create "Restaurante" model class
module.exports = mongoose.model("restaurante", restauranteSchema);