var gulp = require('gulp'),
  exec = require('child_process').exec;

gulp.task('deploy', function (cb) {
  exec('../deploy.sh', function (err, stdout, stderr) {
    if (err !== null)
      cb(err);
  });
});

gulp.task('default', ['deploy']);
