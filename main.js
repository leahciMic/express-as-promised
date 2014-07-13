var express = require('express'),
    bluebird = require('bluebird');

var PRODUCTION = process.env.NODE_ENV == 'production';

function replaceMethod(app, verb) {
  var originalMethod = app[verb].bind(app);

  app[verb] = function(route, callback) {
    var _callback = function(req, res) {

      var getErrorMessage = function(e) {
        if (PRODUCTION) {
          return 'Interal Server Error';
        }
        return e instanceof Error ? e.stack : e;
      };

      var statusCode = res.statusCode;

      var promise = (function() {
        var value;

        try {
          value = callback(req, res);
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

          var httpStatus = verb == 'post' ? 201 : 200;

          if (res.statusCode != statusCode) {
            httpStatus = res.statusCode;
          }

          var Stream = require('stream');
          if (value instanceof Stream) {
            value.pipe(res);
          } else {
            res.status(httpStatus).send(value);
          }
        },
        function(error) {
          res.status(500).send(error);
        }
      );
    };

    if (arguments.length == 1) {
      callback = route;
    }

    var params = [];

    if (arguments.length != 1) {
      params.push(route);
    }

    params.push(_callback);

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