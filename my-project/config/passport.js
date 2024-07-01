const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const usuarioModel = require('../models/usuario')
const usuario = require('../models/usuario')

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},async (email,password,done) => {
    const usuario = await usuarioModel.findOne({email})
    if (!usuario){
        return done(null,false,{message:'Usuario no encontrado'})
    } else{
        const comparacion = await usuario.validar(password)
        if (comparacion){
            return done(null,usuario)
        } else{
            return done(null,false,{message : 'Contraseña incorrecta'})
        }
    }
}))

passport.serializeUser((usuario,done) => {
    done(null,usuario.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const usuario = await usuarioModel.findById(id);
        done(null, usuario);
    } catch (err) {
        done(err, null);
    }
});

