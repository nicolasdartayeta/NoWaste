var express = require('express');
var router = express.Router();

const sidebarModel = require('../helpers/sidebar.js').Sidebar

/* home page. */
router.route('/')
  .get(function(req, res, next) {
    const sidebar = new sidebarModel('Menu principal')

    sidebar.addItem("Menu restaurantes", `/admin/restaurantes`, `#sidebar`)
    sidebar.addItem("Ver modo usuario", `/user`, `#sidebar`)

    res.render('index', {title: 'NoWaste', sidebar: sidebar.sidebar})
  })

module.exports = router;
