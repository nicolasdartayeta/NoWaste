// prueba

const createError = require('http-errors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const bodyParser = require('body-parser')
const mongoConfig = require('./config/mongo')
const indexRouter = require('./routes/index')
const restaurantesRouter = require('./routes/restaurantes')
const userRouter = require('./routes/user')
const loginRouter = require('./routes/login')
const passport = require('passport')
const session = require('express-session')

require('dotenv').config();
require('./config/passport')
const createRoles = require('./helpers/roleSetup');

const app = express()
createRoles()

// Set up mongoose connection
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const mongoDB = mongoConfig.mongoDBUri

main().catch((err) => console.log(err))
async function main () {
  await mongoose.connect(mongoDB)
}

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// middlewares
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser(''))
app.use('/static', express.static(path.join(__dirname, 'public')))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
}));
app.use(passport.initialize())
app.use(passport.session())
app.use('/', indexRouter)
app.use('/admin/restaurantes', restaurantesRouter)
app.use('/user', userRouter)
app.use('/login', loginRouter)


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render('error')
  next()
})

module.exports = app
