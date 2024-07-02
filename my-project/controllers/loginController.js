const asyncHandler = require('express-async-handler')
const usuarioModel = require('../models/usuario')
const passport = require('passport')

exports.signIn = passport.authenticate('local',{ //Uso estrategia definida en passport.js
  successRedirect: '/user',
  failureRedirect: '/login'
})

exports.signUp = asyncHandler(async (req, res, next) => {
  const {email,username,password,confirm_password} = req.body;
  if (password != confirm_password){
    res.send('Las contraseñas no coinciden')
  } else{
    const emailUsuario = await usuarioModel.findOne({email: email})
    if (emailUsuario) {
      res.send('Email ya esta en uso')
    } else {
      const nuevoUsuario = new usuarioModel({email,username,password})
      nuevoUsuario.password = await nuevoUsuario.encriptar(password)
      await nuevoUsuario.save()
      res.redirect('/login')
    }
  }
})

exports.logOut = asyncHandler(async (req, res, next) => {
  req.logout(function(err) {
    if (err) {
        return next(err);
    }
    res.redirect('/login');
});
})

exports.signInWithFacebook = passport.authenticate('facebook');
exports.signInWithFacebookCallback = passport.authenticate('facebook', {
  failureRedirect: '/login',
  successRedirect: '/user'
});
