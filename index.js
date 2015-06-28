var express = require('express'),
  bodyParser = require('body-parser'),
  sh = require('shelljs'),
  bunyan = require('bunyan');

var repos = {
  'git-node': '/home/adampoit/webapps/git_node/git-node'
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
  var repo = request.body.repository.name;
  logger.info('Deploying ' + repo);

  sh.cd(repos[repo]);
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

app.use(function (error, request, response, next) {
  logger.error({ req: request, res: response, error: error }, error.stack);

  response.sendStatus(500);
});
