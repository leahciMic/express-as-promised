  var express = require('../main.js'),
    request = require('request'),
    bluebird = require('bluebird'),
    app,
    server,
    PORT = Math.floor(Math.random() * 8000 + 16000),
    URL = 'http://localhost:' + PORT;

var should = require('should');

describe('express-as-promised', function() {
  beforeEach(function() {
    app = express();
    server = app.listen(PORT);
  });

  afterEach(function() {
    server.close();
  });

  it('should be able to return a string', function(done) {
    app.get('/', function() {
      return 'foo';
    });

    request(URL, function(error, response, body) {
      response.statusCode.should.equal(200);
      body.should.equal('foo');
      done();
    });
  });

  it('should be able to return a resolved promise', function(done) {
    app.get('/', function() {
      return bluebird.resolve('hello world');
    });

    request(URL, function(error, response, body) {
      response.statusCode.should.equal(200);
      body.should.equal('hello world');
      done();
    });
  });

  it('should be able to return a rejected promise', function(done) {
    app.get('/', function() {
      return bluebird.reject('bar');
    });

    request(URL, function(error, response, body) {
      response.statusCode.should.equal(500);
      body.should.equal('bar');
      done();
    });
  });

  it('should be able to throw an error', function(done) {
    app.get('/', function() {
      throw new Error('Something went wrong');
    });

    request(URL, function(error, response, body) {
      response.statusCode.should.equal(500);
      body.should.startWith('Error: Something went wrong\n');
      done();
    });
  });

  it('should be able to return an error', function(done) {
    app.get('/', function() {
      return new Error('Not good');
    });

    request(URL, function(error, response, body) {
      response.statusCode.should.equal(500);
      body.should.startWith('Error: Not good');
      done();
    });
  });

  it('should return 201 for a post', function(done) {
    app.post('/', function() {
      return 'yes';
    });

    request.post(URL, function(error, response, body) {
      response.statusCode.should.equal(201);
      body.should.equal('yes');
      done();
    });
  });

  it('should be able to return json', function(done) {
    app.get('/', function() {
      return {foo: 'bar'};
    });

    request(URL, function(error, response, body) {
      response.statusCode.should.equal(200);

      JSON.parse(body).should.eql({foo: 'bar'});
      done();
    });
  });

  it('should be able to return a stream', function(done) {
    var fs = require('fs');
    app.get('/', function(req, res) {
      res.setHeader('content-type', 'application/octect-stream');
      return fs.createReadStream('./spec/basic.js');
    });

    request(URL, function(error, response, body) {
      response.statusCode.should.equal(200);
      body.should.equal(fs.readFileSync('./spec/basic.js').toString());
      done();
    })
  });

  it('should work with all', function(done) {
    app.all('/', function() {
      return 'hi';
    });

    request(URL, function(error, response, body) {
      response.statusCode.should.equal(200);
      body.should.equal('hi');
      done();
    });
  });

  it('should work with route', function(done) {
    app.route('/test').get(function() {
      return 'foobar';
    });

    request(URL + '/test', function(error, response, body) {
      response.statusCode.should.equal(200);
      body.should.equal('foobar');
      done();
    });
  });

  it('should be able to override status', function(done) {
    app.get('/', function(req, res) {
      res.status(403);
      return 'Not allowed';
    });

    request(URL, function(error, response, body) {
      response.statusCode.should.equal(403);
      body.should.equal('Not allowed');
      done();
    });
  });

  it('should be able to override status', function(done) {
    app.put('/', function(req, res) {
      res.status(200);
      return 'OK';
    });

    request.put(URL, {}, function(error, response, body) {
      response.statusCode.should.equal(200);
      body.should.equal('OK');
      done();
    });
  });

  it('should handle multiple callbacks', function(done) {
    app.get('/', function(req, res, next) {
      res.status(403);
      next();
    }, function(req, res) {
      return 'Hello world';
    });
    request(URL, function(error, response, body) {
      response.statusCode.should.equal(403);
      body.should.equal('Hello world');
      done();
    });
  });

  describe('when using express normally', function() {
    it('should not get in the way', function(done) {
      app.get('/', function(req, res) {
        res.status(403);
        res.send('Hello world');
      });
      request(URL, function(error, response, body) {
        response.statusCode.should.equal(403);
        body.should.equal('Hello world');
        done();
      });
    });
    it('should not get in the way even when using multiple callbacks', function(done) {
      app.get('/', function(req, res, next) {
        res.status(403);
        next();
      }, function(req, res) {
        res.send('Hello world');
      });
      request(URL, function(error, response, body) {
        response.statusCode.should.equal(403);
        body.should.equal('Hello world');
        done();
      });
    });
  });


});