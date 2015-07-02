var gulp = require('gulp'),
  install = require('gulp-install'),
  exec = require('child_process').exec;

gulp.task('install', function () {
  return gulp.src('./package.json')
    .pipe(install());
});

gulp.task('deploy', ['install'], function (cb) {
  exec('../deploy.sh', function (err, stdout, stderr) {
    if (err !== null)
      cb(err);
  });
});

gulp.task('default', ['deploy']);
