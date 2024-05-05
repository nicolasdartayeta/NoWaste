var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  buscarMensajes();
  res.send("HOLA");
});

async function buscarMensajes(){
  console.log("------------------- Conexion ----------------------")
  const { MongoClient } = require("mongodb")
  const dbName = 'appMensajeria';
  const uri = 'mongodb://nicolas:nicolas@mongodb:27017/' + dbName ;
  const client = new MongoClient(uri);
  client.connect()
  const database = client.db(dbName);
  const messages = database.collection('users');
  var mensajes = messages.find();
  try {
    console.log(await mensajes.toArray());
  } finally {
    console.log("-------- Terminado ------------")
  }
}

module.exports = router;
