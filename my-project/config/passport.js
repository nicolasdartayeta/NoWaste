const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const usuarioModel = require('../models/usuario')

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},async (email,password,done) => {
    const user = await usuarioModel.findOne({email})
    if (!user){
        return done(null,false,{message:'Usuario no encontrado'})
    } else{
        const comparacion = await user.validar(password)
        if (comparacion){
            return done(null,user)
        } else{
            return done(null,false,{message : 'Contraseña incorrecta'})
        }
    }
}))

passport.serializeUser((user,done) => {
    done(null,user.id)
})

passport.deserializeUser(async (id, done) => {
    try {
        const user = await usuarioModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

