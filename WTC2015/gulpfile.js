/// <binding BeforeBuild='build' />

var gulp = require('gulp');
var streamqueue = require('streamqueue');

var dest = "./www/";
var plugins = require("gulp-load-plugins")({
  pattern: ['gulp-*', 'gulp.*', 'main-bower-files'],
  replaceString: /\bgulp[\-.]/
});

gulp.task('jsLibs', function () {
  gulp.src(plugins.mainBowerFiles())
		.pipe(plugins.filter('*.js'))
    .pipe(plugins.order([
      "angular.js",
      "angular-*.js",
      "ionic.js",
      "ionic-*.js"
    ]))
		.pipe(plugins.concat('vendor.js'))
		.pipe(plugins.uglify())
		.pipe(gulp.dest(dest + 'js'));
});

gulp.task('fontLibs', function () {
  gulp.src(plugins.mainBowerFiles())
		.pipe(plugins.filter(['*.ttf', '*.woff', '*.svg', '*.eot']))
    .pipe(gulp.dest(dest + 'fonts'));
});

gulp.task('cssLibs', function () {
  var files = gulp.src(plugins.mainBowerFiles())
  var cssFiles = files.pipe(plugins.filter('*.css'));
  var lessFiles = files.pipe(plugins.filter('*.less')).pipe(plugins.less());
  return streamqueue({ objectMode: true }, cssFiles, lessFiles)
		.pipe(plugins.concat('vendor.css'))
		.pipe(plugins.minifyCss())
		.pipe(gulp.dest(dest + 'css'));
});

gulp.task("build", ["jsLibs", "cssLibs", "fontLibs"], function () {

});

gulp.task('default', ['build'], function () {
  // place code for your default task here
});