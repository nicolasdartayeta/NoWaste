const mongoose = require('mongoose')

// Define a schema
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    nombre: String
  })

module.exports = mongoose.model("roles", roleSchema);