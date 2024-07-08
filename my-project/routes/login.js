const express = require('express')
const router = express.Router()
const loginController = require('../controllers/loginController')
const passport = require('passport');

router.route('/')
  .get(function (req, res, next) {
    res.appendHeader('HX-Redirect', '/login')
    res.render('login/htmxLoginForm')
  })
  .post(loginController.signIn)

router.route('/register')
  .get(function (req, res, next) {
    res.render('login/htmxRegisterForm')
  })
  .post(loginController.signUp)

router.route('/logout')
  .get(loginController.logOut)

router.get('/auth/facebook', loginController.signInWithFacebook)
router.get('/auth/facebook/callback', loginController.signInWithFacebookCallback)

router.get('/auth/google', loginController.signInWithGoogle)
router.get('/auth/google/callback', loginController.signInWithGoogleCallback);

module.exports = router
