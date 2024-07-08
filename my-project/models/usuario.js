const mongoose = require('mongoose')
const bcrypt= require('bcryptjs') 

// Define a schema
const Schema = mongoose.Schema

const usuarioSchema = new Schema({
  email:{type: String, required: true, unique: true},
  username:{type: String, required: true},
  password: {type: String, required: true},
  roles: [{
    ref: "roles",
    type: Schema.Types.ObjectId
  }]
})

//Cifrado contraseña
usuarioSchema.methods.encriptar = async password => {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password,salt)
}
  
//Validar contraseña
usuarioSchema.methods.validar = async function(password)  {
  return await bcrypt.compare(password,this.password) 
}

// Export function to create "Usuario" model class
module.exports = mongoose.model('usuario', usuarioSchema)
