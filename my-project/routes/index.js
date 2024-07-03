var express = require('express');
var router = express.Router();

const sidebarModel = require('../helpers/sidebar.js')

/* home page. */
router.route('/')
  .get(function(req, res, next) {
    const sidebar = new sidebarModel('Menu principal')

    sidebar.addItem("Ver restaurantes", `${baseURL}/add`, `#content`)
    sidebar.addItem("Ver modo usuario", `${baseURL}/show`, `#sidebar`)

    // res.render('index', {title: 'NoWaste', sidebar: sidebar.sidebar})

    res.render('index', { title: 'NoWaste'});
  })

module.exports = router;
