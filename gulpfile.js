var gulp = require("gulp");
var jshint = require("gulp-jshint");
var prettify = require('gulp-jsbeautifier');
var mocha = require('gulp-mocha');
var stylus = require('gulp-stylus');
var concat = require('gulp-concat');
var minifycss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var gulpify = require('gulpify');

var scripts = ['gulpfile.js', 'js/*.js', '!js/bundle.js'];

gulp.task("lint", function () {
  gulp.src(scripts)
    .pipe(jshint())
    .pipe(jshint.reporter("default"));
});

gulp.task('jsbeautify-verify', function () {
  gulp.src(scripts)
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_ONLY'
    }));
});

gulp.task('jsbeautify', function () {
  gulp.src(scripts, {
    base: './'
  })
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('./'))
});

gulp.task('mocha', function () {
  return gulp.src('test/*.js')
    .pipe(mocha({
      reporter: 'spec'
    }));
});

gulp.task('css', function () {
  gulp.src(['node_modules/normalize.css/normalize.css', 'css/stylus/s.styl'])
    .pipe(stylus({
      compress: true
    }))
    .pipe(concat('s.css'))
    .pipe(gulp.dest('./css/'));
});

gulp.task('browserify', function () {
  gulp.src('js/index.js')
    .pipe(gulpify('bundle.js'))
  //.pipe(uglify())
  .pipe(gulp.dest('./js'));
});

gulp.task("default", ["lint"]);
