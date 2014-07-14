# Express as promised [![Build Status](https://travis-ci.org/leahciMic/express-as-promised.svg?branch=master)](https://travis-ci.org/leahciMic/express-as-promised)

This is simply the Express we all know and love with a few enhancements to
 support returning various values including promises.

So instead of:

```js
app.get('/', function(request, response) {
  return quote.fetch().then(function(quote) {
    response.send(quote);
  });
});
```

We can simply just return the promise:

```js
app.get('/', function() {
  return quote.fetch();
});
```

Both will result in something like:

```text
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 84
Date: Sat, 12 Jul 2014 14:40:14 GMT
Connection: keep-alive

{quote: "The true measure of a man is how he treats somebody that can him no good."}
```

## Returning values

You can return strings, objects, strings or their promised equivelant.

### Promises
```js
app.get('/', function() {
  var promise = bluebird.resolve('Hello world');
  return promise;
});
```

```text
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 11
Date: Sat, 12 Jul 2014 14:40:14 GMT
Connection: keep-alive

Hello world
```

### Strings

```js
app.get('/', function( {
  return 'Hello world';
})

```text
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 11
Date: Sat, 12 Jul 2014 14:40:14 GMT
Connection: keep-alive

Hello world
```

## Errors and production

If your callback throws or returns an error a stack trace will be sent, for example:

```js
app.get('/', function() {
  throw new Error('Something went wrong.');
});
```

```text
HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 1059
Date: Sat, 12 Jul 2014 14:41:56 GMT
Connection: keep-alive

Error: Something went wrong
    at /Users/michael/Projects/express-as-promised/tests.js:5:9
    at /Users/michael/Projects/express-as-promised/main.js:13:19
    at Object._callback [as handle] (/Users/michael/Projects/express-as-promised/main.js:29:9)
    at next_layer (/Users/michael/Projects/express-as-promised/node_modules/express/lib/router/route.js:113:13)
    at Route.dispatch (/Users/michael/Projects/express-as-promised/node_modules/express/lib/router/route.js:117:5)
    at /Users/michael/Projects/express-as-promised/node_modules/express/lib/router/index.js:222:24
    at Function.proto.process_params (/Users/michael/Projects/express-as-promised/node_modules/express/lib/router/index.js:288:12)
    at next (/Users/michael/Projects/express-as-promised/node_modules/express/lib/router/index.js:216:19)
    at Layer.expressInit [as handle] (/Users/michael/Projects/express-as-promised/node_modules/express/lib/middleware/init.js:23:5)
    at trim_prefix (/Users/michael/Projects/express-as-promised/node_modules/express/lib/router/index.js:263:17)
```

### Turning off errors in production

Unless `NODE_ENV` is set to production, then you'll just get:

```text
HTTP/1.1 500 Internal Server Error
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 20
Date: Sat, 12 Jul 2014 14:45:51 GMT
Connection: keep-alive

Interal Server Error
```

### Custom status codes

You can still use a custom status code when required:

```js
app.get('/', function(req, res) {
  res.status(403);
  return 'Not allowed';
});
```

```text
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: text/html; charset=utf-8
Content-Length: 11
Date: Sun, 13 Jul 2014 05:17:03 GMT
Connection: keep-alive

Not allowed
```

## Can be used just like Express

And everything you're doing right now with Express, should just work.

```js
app.get('/', function(req, res, next) {
  res.status(403);
  next();
}, function(req, res) {
  res.send('Hello world');
});
```

or even:

```js
app.get('/', function(req, res, next) {
  res.status(403);
  next();
}, function(req, res) {
  return 'Hello world';
});
```

## Tests

Just simply run `npm test`