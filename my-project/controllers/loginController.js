const asyncHandler = require("express-async-handler");
const usuarioModel = require('../models/usuario');

var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    var usuario = await usuarioModel.findOne({username: username}).exec()

    if (usuario) {
        crypto.pbkdf2(password, usuario.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
            if (err) { return cb(err); }
            if (!crypto.timingSafeEqual(usuario.hashed_password, hashedPassword)) {
              return cb(null, false, { message: 'Incorrect password.' });
            }
            return cb(null, usuario);
          });
    } else {
        console.log('No hay un usuario con ese nombre')
        return cb(null, false, { message: 'Incorrect username.' })
    }
  }));

exports.authenticate = asyncHandler( async (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/success',
        failureRedirect: '/login',
    });
})
