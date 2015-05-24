/**
 * Express configuration
 */

'use strict';

var express = require('express');
var favicon = require('serve-favicon');
var morgan = require('morgan');
var compression = require('compression');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var cookieParser = require('cookie-parser');
var errorHandler = require('errorhandler');
var path = require('path');
var config = require('./environment');
var passport = require('passport');
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var mongoose = require('mongoose');
var four0four = require('./../utils/404')();

module.exports = function (app) {
  var env = app.get('env');

  app.set('views', config.root + '/server/views');
  app.set('view engine', 'jade');
  app.use(compression());
  app.use(bodyParser.urlencoded({extended: false}));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(cookieParser());
  app.use(passport.initialize());

  // Persist sessions with mongoStore
  // We need to enable sessions for passport twitter because its an oauth 1.0 strategy
  app.use(session({
    secret: config.secrets.session,
    resave: true,
    saveUninitialized: true,
    store: new mongoStore({mongooseConnection: mongoose.connection})
  }));

  var client;
  var tmp;

  if ('production' === env) {
    app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('appPath', config.root + '/public');
    app.use(morgan('dev'));
  }

  if ('development' === env || 'test' === env) {
    client = path.join(config.root, 'src/client');
    tmp = path.join(config.root, '.tmp/serve/');
    var bower = path.join(config.root, 'bower_components/');
    var index = path.join(config.root, 'src/client/index.html');

    console.log('Directories: ');
    console.log('Client: ' + client);
    console.log('tmp: ' + tmp);
    console.log('bower: ' + bower);

    console.log('** DEV **');
    app.use(express.static(client));
    app.use(express.static(bower));
    app.use(express.static(tmp));
    // All the assets are served at this point.
    // Any invalid calls for templateUrls are under app/* and should return 404
    app.use('/app/*', function(req, res, next) {
      four0four.send404(req, res);
    });
    // Any deep link calls should return index.html
    app.use('/*', express.static(index));
    app.use(morgan('dev'));
    app.use(errorHandler()); // Error handler - has to be last

    //app.use(require('connect-livereload')());
    //app.use(express.static(tmp));
    //app.use(express.static(client));
    //app.use(express.static(bower));
    //app.set('appPath', 'client');
    //app.use(morgan('dev'));
    //app.use(errorHandler()); // Error handler - has to be last
  }
};
