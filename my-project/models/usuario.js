const mongoose = require('mongoose')

// Define a schema
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
  username: String,
  hashedPassword: String,
  salt: String,

});

// Export function to create "Restaurante" model class
module.exports = mongoose.model("usuario", usuarioSchema);