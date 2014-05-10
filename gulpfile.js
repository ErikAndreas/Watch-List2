var gulp = require("gulp");
var jshint = require("gulp-jshint");
var prettify = require('gulp-jsbeautifier');
var mocha = require('gulp-mocha');

var scripts = ['Gruntfile.js', 'js/*.js', '!js/bundle.js'];

gulp.task("lint", function() {
    gulp.src(scripts)
        .pipe(jshint())
        .pipe(jshint.reporter("default"));
});

gulp.task('jsbeautify-verify', function() {
  gulp.src(scripts)
    .pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_ONLY'}))
});

gulp.task('jsbeautify', function() {
  gulp.src(scripts)
    .pipe(prettify({config: '.jsbeautifyrc', mode: 'VERIFY_AND_WRITE'}))
    .pipe(gulp.dest('./js'))
});

gulp.task('mocha', function () {
    return gulp.src('test/*.js')
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task("default", ["lint"]);