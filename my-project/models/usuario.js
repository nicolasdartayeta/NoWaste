const mongoose = require('mongoose')

// Define a schema
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
  username: String,
  password: String,

});

// Export function to create "Restaurante" model class
module.exports = mongoose.model("restaurante", restauranteSchema);