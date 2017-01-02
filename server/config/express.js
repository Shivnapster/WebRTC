

'use strict';

var bodyParser = require('body-parser');
var express = require('express');
var path = require('path');
var config = require('../config');
module.exports = function(options, app) {
	app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
    extended: false
  }));
 
  app.use(express.static(config.root+"/client"));

  return require('https').createServer(options, app);
}