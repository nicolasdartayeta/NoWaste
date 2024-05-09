const mongoose = require('mongoose')

// Define a schema
const Schema = mongoose.Schema;

const restauranteSchema = new Schema({
  nombre: String,
  calle: String,
  numero: Number,
  producto: [{
                nombre: String,
                descripcion: String,
                precio: Number
            }],
});

// Export function to create "Restaurante" model class
module.exports = mongoose.model("restaurante", restauranteSchema);