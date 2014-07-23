// dependencies

var gulp = require('gulp');
var bump = require('gulp-bump');
var fs = require('fs');
var packagejson;
var version;
var choices = require('choices');
var jshint = require('gulp-jshint');
var edit = require('node-edit');
var exec = require('child_process').exec;

// commonly used functions

function execute(command, callback){
  exec(command, function(error, stdout, stderr){
    if (error) {
      console.log(stderr);
      process.exit();
    }
    callback(stdout);
  });
}

// read the package.json
try {
  packagejson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
} catch(e) {
  throw new Error('Could not read package.json, invalid json perhaps?');
}

// get the version number
version = packagejson.version;

// it's all we're using gulp for!
gulp.task('default', ['release']);

// step1. jshint will fail the build
gulp.task('jshint', function() {
  return gulp.src(['./*.js', './spec/**/*.js'])
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'))
  .pipe(jshint.reporter('fail'));
});

// step2. bump the version number (requires jshint pass)
gulp.task('bump', ['jshint'], function(done) {
  var levels = ['Patch', 'Minor', 'Major'];
  choices('Pick an option', levels, function(idx) {
    var options = {
      type: levels[idx].toLowerCase()
    };

    gulp.src('./package.json')
    .pipe(bump(options))
    .pipe(gulp.dest('./'))
    .on('end', function() {
      done();
    });
  });
});

// step3. capture release log and commit + tag + push + npm publish
gulp.task('release', ['bump'], function(done) {
  var latest_version = JSON.parse(fs.readFileSync('./package.json', 'utf8')).version;

  execute('git log --oneline ' + version, function(diff) {
    edit('# Please enter a description for this change set.\n' + diff, function(description) {
      execute('git commit -a -m "' + description + '"', function() {
        execute('npm version patch -m "' + description + '"', function() {
          execute('git tag ' + latest_version + ' -m "' + description + '"', function() {
            execute('git push origin master', function() {
              execute('npm publish', function() {
                done();
              });
            });
          });
        });
      });
    });
  });



});