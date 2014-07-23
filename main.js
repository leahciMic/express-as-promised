// required dependencies
var express = require('express'),
    bluebird = require('bluebird');

// is our environment production?
var PRODUCTION = process.env.NODE_ENV == 'production';

// this generic function is called with a route and will replace the generic verb
// functions such as (get, post, put, delete, all), with new callbacks that are
// aware of promises.
function replaceMethod(app, verb) {
  // the original method we'll be overwriting
  var originalMethod = app[verb].bind(app),
      params = [];

  // the new method that is aware of promises and return types
  app[verb] = function(route) {
    // grab all the callbacks from the arguments
    var callbacks = [].slice.call(arguments, arguments.length > 1 ? 1 : 0);

    // for each callback
    var newCallbacks = callbacks.map(function(callback) {
      // return a new callback that is aware of promises
      return function(req, res, next) {
        // returns generic 'Interal Server Error', or stack trace depending
        // on environment
        var getErrorMessage = function(e) {
          if (PRODUCTION) {
            return 'Internal Server Error';
          }
          return e instanceof Error ? e.stack : e;
        };

        // converts the value of the original callback into a promise if it's
        // not already
        var promise = (function() {
          var value;

          // if the callback throws an error, return a rejected promise
          try {
            value = callback(req, res, next);
          } catch(e) {
            return bluebird.reject(getErrorMessage(e));
          }

          // if the callback returns an error, return a rejected promise
          if (value instanceof Error) {
            return bluebird.reject(getErrorMessage(value));
          }

          // else return a resolved promise with the value of the callback
          return bluebird.resolve(value);
        })();

        // once the promise is resolved
        promise.then(
          function(value) {
            // if it's null or undefined, do nothing
            if (value === null || value === undefined) {
              return;
            }

            // if it's a successful post change the status code to 201
            if (verb == 'post' && res.statusCode == 200) {
              res.statusCode = 201;
            }


            var Stream = require('stream');
            if (value instanceof Stream) {
              // if it's an instance of a stream, pipe it to the response
              value.pipe(res);
            } else {
              // otherwise send the final value
              res.send(value);
            }
          },
          function(error) {
            // if the promise is rejected, send the error
            res.status(500).send(error);
          }
        );
      };
    });

    // if a route was specified add it to the params
    if (arguments.length > 1) {
      params.push(route);
    }

    // concatenate the new callbacks to the params
    params = params.concat(newCallbacks);

    // call the original method with our newly modified callbacks
    originalMethod.apply(app, params);
  };
};

// promisify express
function promisifyExpress(app) {
  // replace all verbs on the base route
  ['all', 'put', 'post', 'delete', 'get'].forEach(function(verb) {
    replaceMethod(app, verb);
  });

  var route = app.route;

  // replace the original route method, with one that will replace each of the
  // verbs on the route returned
  app.route = function() {
    var args = [].slice.call(arguments);
    var _route = route.apply(app, args);

    // replace all verbs on this route
    ['all', 'put', 'post', 'delete', 'get'].forEach(function(verb) {
      replaceMethod(_route, verb);
    });
    return _route;
  };

  return app;
}

// constructs an express-as-promised app
function createApplication() {
  return promisifyExpress(express());
};

// export it
module.exports = createApplication;