var spawn = require('child_process').spawn;
var path = require('path');
var series = require('run-series');
var assert = require('assert');

function test(filename) {
  return function(cb) {
    var proc = spawn(process.argv[0], [ filename ], { stdio: 'inherit' });
    proc.on('close', function (code) {
      cb(code !== 0 ? new Error('test ' + path.basename(filename) + ' failed') : null);
    });
  };
}

// "polyfill" deepStrictEqual on Node 0.12 and below
if (!assert.deepStrictEqual) {
  assert.deepStrictEqual = assert.strictEqual;
}

series([
  test(require.resolve('./debug')),
  test(require.resolve('./format')),
  test(require.resolve('./inspect')),
  test(require.resolve('./log')),
  test(require.resolve('./promisify')),
  test(require.resolve('./callbackify')),
  test(require.resolve('./types'))
], function (err) {
  if (err) throw err
});
