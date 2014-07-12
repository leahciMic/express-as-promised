# Express as promised

This is simply the Express we all know and love promisified. I'll dive right in
with an example.

```js
var express = require('express-as-promised'),
    app = express();

app.get('/', function() {
  return 'Hello world';
});

app.listen(3000);
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

You can return strings, objects, strings or their promised equivelant and if your
callback throws or returns an error a stack trace will be sent, for example:

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