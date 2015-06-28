var express = require('express'),
  bodyParser = require('body-parser'),
  sh = require('shelljs'),
  bunyan = require('bunyan'),
  _ = require('underscore');

var repos = {
  'git-node': [
    {
      branch: 'master',
      path: '/home/adampoit/webapps/git_node/git-node'
    }
  ],
  'tranquil-web': [
    {
      branch: 'production',
      path: '/home/adampoit/webapps/tranquil_production/tranquil-web'
    }
  ]
};

var logger = bunyan.createLogger({
  name: 'git-node',
  streams: [
    {
      level: 'info',
      path: '/home/adampoit/git_node.log'
    },
  ]
});

var app = express();
app.use(bodyParser.json());

var server = app.listen(28596, function () {
  logger.info('git-node started');
});

app.post('/', function (request, response, next) {
  var payload = request.body;
  var repo = payload.repository.name;
  logger.info('Deploying ' + repo);

  _.each(repos[repo], function (repository, index, list) {
    if (payload.ref.indexOf(repository.branch) == -1)
      return;

    logger.info('Deploying ' + repository.branch + ' branch');

    sh.cd(repository.path);
    sh.exec('git checkout ' + repository.branch);
    sh.exec('git pull', function (code, output) {
      if (code !== 0)
        return next(new Error(output));

      response.sendStatus(200);

      sh.cd('..');
      sh.exec('./deploy.sh', function (code, output) {
        if (code !== 0)
          logger.error(output);
      });
    });
  });
});

app.use(function (error, request, response, next) {
  logger.error({ req: request, res: response, error: error }, error.stack);

  response.sendStatus(500);
});
