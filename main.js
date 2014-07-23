var express = require('express'),
    bluebird = require('bluebird');

var PRODUCTION = process.env.NODE_ENV == 'production';

function replaceMethod(app, verb) {
  var originalMethod = app[verb].bind(app);

  app[verb] = function(route) {
    var callbacks = [].slice.call(arguments, arguments.length > 1 ? 1 : 0);

    var newCallbacks = callbacks.map(function(callback) {
      return function(req, res, next) {
        var getErrorMessage = function(e) {
          if (PRODUCTION) {
            return 'Internal Server Error';
          }
          return e instanceof Error ? e.stack : e;
        };

        var promise = (function() {
          var value;

          try {
            value = callback(req, res, next);
          } catch(e) {
            return bluebird.reject(getErrorMessage(e));
          }

          if (value instanceof Error) {
            return bluebird.reject(getErrorMessage(value));
          }

          return bluebird.resolve(value);
        })();

        promise.then(
          function(value) {
            if (value === null || value === undefined) {
              return;
            }

            // if it's a successful post change the status code to 201
            if (verb == 'post' && res.statusCode == 200) {
              res.statusCode = 201;
            }

            var Stream = require('stream');
            if (value instanceof Stream) {
              value.pipe(res);
            } else {
              res.send(value);
            }
          },
          function(error) {
            res.status(500).send(error);
          }
        );
      };
    });

    var params = [];

    if (arguments.length > 1) {
      params.push(route);
    }

    params = params.concat(newCallbacks);

    originalMethod.apply(app, params);
  };
};


function promisifyExpress(app) {
  ['all', 'put', 'post', 'delete', 'get'].forEach(function(verb) {
    replaceMethod(app, verb);
  });

  var route = app.route;

  app.route = function() {
    var args = [].slice.call(arguments);
    var _route = route.apply(app, args);

    ['all', 'put', 'post', 'delete', 'get'].forEach(function(verb) {
      replaceMethod(_route, verb);
    });
    return _route;
  };

  return app;
}

function createApplication() {
  return promisifyExpress(express());
};

module.exports = createApplication;