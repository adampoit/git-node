var gulp = require('gulp'),
  install = require('gulp-install'),
  shell = require('gulp-shell');

gulp.task('install', function () {
  return gulp.src('./package.json')
    .pipe(install());
});

gulp.task('deploy', ['install'], shell.task([
  '../deploy.sh'
]));

gulp.task('default', ['deploy']);
