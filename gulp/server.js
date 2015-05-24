'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');
var args = require('yargs').argv;
var $ = require('gulp-load-plugins')();
var util = require('util');
var middleware = require('./proxy');
var freeport = require('freeport');

var port = process.env.PORT;

module.exports = function (options) {

  function browserSyncInit(baseDir, browser) {
    browser = browser === undefined ? 'default' : browser;

    var routes = null;
    if (baseDir === options.src || (util.isArray(baseDir) && baseDir.indexOf(options.src) !== -1)) {
      routes = {
        '/bower_components': 'bower_components'
      };
    }

    var server = {
      baseDir: baseDir,
      routes: routes
    };

    if (middleware.length > 0) {
      server.middleware = middleware;
    }

    browserSync.instance = browserSync.init({
      startPath: '/',
      server: server,
      browser: browser,
      port: options.browserSyncPort
    });
  }

  browserSync.use(browserSyncSpa({
    selector: '[ng-app]'// Only needed for angular apps
  }));

  gulp.task('serve', ['watch'], function () {
    browserSyncInit([options.tmp + '/serve', options.src]);
  });

  gulp.task('serve:dist', ['build'], function () {
    browserSyncInit(options.dist);
  });

  gulp.task('serve:e2e', ['inject'], function () {
    browserSyncInit([options.tmp + '/serve', options.src], []);
  });

  gulp.task('serve:e2e-dist', ['build'], function () {
    browserSyncInit(options.dist, []);
  });

  /**
   * serve the dev environment
   * --debug-brk or --debug
   * --nosync
   */
  gulp.task('serve-dev', ['watch'], function () {
    freeport(function (err, port) {
      if (err){
        throw err
      }
      log('Free port: ' + port);
      /*isDev , port*/
      serve(true, port);
    })
  });

  /**
   * serve the build environment
   * --debug-brk or --debug
   * --nosync
   */
  gulp.task('serve-build', ['build'], function () {
    freeport(function (err, port) {
      if (err){
        throw err
      }
      log('Free port: ' + port);
      /*isDev , port*/
      serve(false, port);
    })
  });

  /**
   * serve the code
   * --debug-brk or --debug
   * --nosync
   * @param  {Boolean} isDev - dev or build mode
   */
  function serve(isDev, port) {
    var debug = args.debug || args.debugBrk;
    var debugMode = args.debug ? '--debug' : args.debugBrk ? '--debug-brk' : '';

    var nodeOptions = getNodeOptions(isDev, port);

    if (debug) {
      runNodeInspector();
      nodeOptions.nodeArgs = [debugMode + '=5858'];
    }

    if (args.verbose) {
      console.log(nodeOptions);
    }

    return $.nodemon(nodeOptions)
      .on('restart', ['scripts'], function (ev) {
        log('*** nodemon restarted');
        log('files changed:\n' + ev);
      })
      .on('start', function () {
        log('*** nodemon started');
      })
      .on('crash', function () {
        log('*** nodemon crashed: script crashed for some reason');
      })
      .on('exit', function () {
        log('*** nodemon exited cleanly');
      });
  }

  function getNodeOptions(isDev, freePort) {
    log('Node options:');
    return {
      script: options.nodeServer,
      delayTime: 1,
      env: {
        'PORT': port || freePort || options.defaultPort,
        //'PORT': port || freePort || options.defaultPort,
        'NODE_ENV': isDev ? 'development' : 'development'
      },
      watch: [options.server]
    };
  }


};

function runNodeInspector() {
  log('Running node-inspector.');
  log('Browse to http://localhost:8080/debug?port=5858');
  var exec = require('child_process').exec;
  exec('node-inspector');
}

/**
 * Log a message or series of messages using chalk's blue color.
 * Can pass in a string, object or array.
 */
function log(msg) {
  if (typeof(msg) === 'object') {
    for (var item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.blue(msg[item]));
      }
    }
  } else {
    $.util.log($.util.colors.blue(msg));
  }
}
