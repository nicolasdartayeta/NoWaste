const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
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


//Si se elimina a la vez eliminar las rutas, el contenido del controlador, las variables de entorno y las dependencias(passport-facebook y dotenv) q no son necesarias
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/login/auth/facebook/callback",
    profileFields: ['id', 'email', 'name'] 
  }, async (accessToken, refreshToken, profile, done) => {
    const { id, email, name } = profile;
    try {
        console.log(email);
        console.log(id);
        console.log(name);
        if (!email) {
            return done(null, false, { message: 'El correo electrónico no está disponible.' });
          }
        const user = await usuarioModel.findOne({email: profile.email});
        if (user) {
          return done(null, user);
        } else {
          const nuevoUsuario = new usuarioModel({           //La contraseña esta mal, pero nose como crear este perfil de facebook
            email: profile.email,
            username: profile.displayName, 
            password: 'facebookUser' 
          });
          await nuevoUsuario.save();
          return done(null, nuevoUsuario);
        }
      } catch (err) {
        return done(err);
      }
    }));


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
