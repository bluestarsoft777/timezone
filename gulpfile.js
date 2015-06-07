'use strict';

var gulp = require('gulp'),
    eslint = require('gulp-eslint'),
    browserify = require('gulp-browserify'),
    concat = require('gulp-concat'),
    del = require('del'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer');

// Modules for webserver and livereload
var express = require('express'),
    refresh = require('gulp-livereload'),
    livereload = require('connect-livereload'),
    livereloadport = 35729,
    serverport = 5000;

// Set up an express server (not starting it yet)
var server = express();
// Add live reload
server.use(livereload({port: livereloadport}));
// Use our 'public' folder as rootfolder
server.use(express.static('./public'));
// Because I like HTML5 pushstate .. this redirects everything back to our index.html
server.all('/*', function(req, res) {
  res.sendFile('index.html', { root: 'public' });
});

// Dev task
gulp.task('dev', ['views', 'styles', 'lint', 'browserify', 'copy'], function() { });
gulp.task('build', ['clean', 'views', 'styles', 'lint', 'browserify', 'copy'], function() { });

gulp.task('copy', ['copyVendor', 'copyImages']);

gulp.task('copyVendor', function () {
  return gulp.src([
      'app/vendor/**/*'
    ], {
      dot: true
    })
    .pipe(gulp.dest('public/vendor'));
});

gulp.task('copyImages', function () {
  return gulp.src([
      'app/images/**/*'
    ], {
      dot: true
    })
    .pipe(gulp.dest('public/images'));
});

// Clean task - Deletes the output directories
gulp.task('clean', del.bind(null, ['.tmp', 'public'], {force: true}));

// ESLint task
gulp.task('lint', function() {
  gulp.src('./app/scripts/*.js')
  .pipe(eslint())
  // You can look into pretty reporters as well, but that's another story
  .pipe(eslint.format());
});

// Styles task
gulp.task('styles', function() {
  gulp.src('app/styles/*.scss')
  // The onerror handler prevents Gulp from crashing when you make a mistake in your SASS
  .pipe(sass({onError: function(e) { console.log(e); } }))
  // Optionally add autoprefixer
  .pipe(autoprefixer('last 2 versions', '> 1%', 'ie 8'))
  // These last two should look familiar now :)
  .pipe(gulp.dest('public/styles/'));
});

// Browserify task
gulp.task('browserify', function() {
  // Single point of entry (make sure not to src ALL your files, browserify will figure it out)
  gulp.src(['app/scripts/app.js'])
  .pipe(browserify({
    insertGlobals: true,
    debug: false
  }))
  // Bundle to a single file
  .pipe(concat('bundle.js'))
  // Output it to our public folder
  .pipe(gulp.dest('public/scripts'));
});

// Views task
gulp.task('views', function() {
  // Get our index.html
  gulp.src('app/index.html')
  // And put it in the public folder
  .pipe(gulp.dest('public/'));

  // Any other view files from app/views
  gulp.src('app/views/**/*')
  // Will be put in the public/views folder
  .pipe(gulp.dest('public/views/'));
});

gulp.task('watch', ['lint'], function() {
  // Start webserver
  server.listen(serverport);
  // Start live reload
  refresh.listen(livereloadport);

  // Watch our scripts, and when they change run lint and browserify
  gulp.watch(['app/scripts/*.js', 'app/scripts/**/*.js'], [
    'lint',
    'browserify'
  ]);
  // Watch our sass files
  gulp.watch(['app/styles/**/*.scss'], [
    'styles'
  ]);

  gulp.watch(['app/**/*.html'], [
    'views'
  ]);

  gulp.watch('./public/**').on('change', refresh.changed);
});

gulp.task('default', ['dev', 'watch']);
