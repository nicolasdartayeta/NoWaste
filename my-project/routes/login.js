const express = require('express')
const router = express.Router()
const loginController = require('../controllers/loginController')

router.route('/')
  .get(function (req, res, next) {
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

module.exports = router
