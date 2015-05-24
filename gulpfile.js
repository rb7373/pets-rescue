'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var wrench = require('wrench');

var $ = require('gulp-load-plugins')();

var options = {
  /**
   * Node settings
   */
  nodeServer: './src/server/app.js',
  server : './src/server/',
  defaultPort: '9001',
  browserSyncPort: '7070',
  /**
   * browser sync
   */
  browserReloadDelay: 1000,
  src: 'src/client',
  dist: 'dist',
  tmp: '.tmp',
  e2e: 'e2e',
  errorHandler: function (title) {
    return function (err) {
      gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
      this.emit('end');
    };
  },
  wiredep: {
    directory: 'bower_components',
    exclude: [/jquery/]
  }
};

wrench.readdirSyncRecursive('./gulp').filter(function (file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function (file) {
  require('./gulp/' + file)(options);
});

/**
 * List the available gulp tasks
 */
gulp.task('help', $.taskListing);
gulp.task('default', ['help']);
