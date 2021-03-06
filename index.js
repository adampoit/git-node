var express = require('express'),
  bodyParser = require('body-parser'),
  bunyan = require('bunyan'),
  _ = require('underscore'),
  exec = require('child_process').exec,
  path = require('path'),
  config = require('../config');

var logger = bunyan.createLogger({
  name: 'git-node',
  streams: [
    {
      level: 'info',
      path: config.logfile
    },
  ]
});

var app = express();
app.use(bodyParser.json());

var server = app.listen(config.port, function () {
  logger.info('git-node started');
});

app.post('/', function (request, response, next) {
  var payload = request.body;
  var repo = payload.repository.name;
  logger.info('Deploying ' + repo);

  _.each(config.repos[repo], function (repository, index, list) {
    if (payload.ref.indexOf(repository.branch) == -1)
      return;

    logger.info('Deploying ' + repository.branch + ' branch');

    var workspace = path.join(repository.path, repo);
    exec('git checkout ' + repository.branch, { cwd: workspace }, function (error, stdout, stderr) {
      if (error !== null)
        return next(error);

      exec('git pull', { cwd: workspace }, function (error, stdout, stderr) {
        if (error !== null)
          return next(error);

        response.sendStatus(200);

        exec('gulp deploy', { cwd: workspace }, function (error, stdout, stderr) {
          if (error !== null)
            logger.error(error);
        });
      });
    });
  });
});

app.use(function (error, request, response, next) {
  logger.error({ req: request, res: response, error: error }, error.stack);

  response.sendStatus(500);
});
