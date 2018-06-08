// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';
var assert = require('assert');
var ObjectAssign = require('object.assign');

var modeArgv = process.argv[2]
var sectionArgv = process.argv[3]

if (modeArgv === 'child')
  child(sectionArgv);
else
  parent();

function parent() {
  test('foo,tud,bar', true, 'tud');
  test('foo,tud', true, 'tud');
  test('tud,bar', true, 'tud');
  test('tud', true, 'tud');
  test('foo,bar', false, 'tud');
  test('', false, 'tud');

  test('###', true, '###');
  test('hi:)', true, 'hi:)');
  test('f$oo', true, 'f$oo');
  test('f$oo', false, 'f.oo');
  test('no-bar-at-all', false, 'bar');

  test('test-abc', true, 'test-abc');
  test('test-a', false, 'test-abc');
  test('test-*', true, 'test-abc');
  test('test-*c', true, 'test-abc');
  test('test-*abc', true, 'test-abc');
  test('abc-test', true, 'abc-test');
  test('a*-test', true, 'abc-test');
  test('*-test', true, 'abc-test');
}

function test(environ, shouldWrite, section) {
  var expectErr = '';
  var expectOut = 'ok\n';

  var spawn = require('child_process').spawn;
  var child = spawn(process.execPath, [__filename, 'child', section], {
    env: ObjectAssign(process.env, { NODE_DEBUG: environ })
  });

  if (shouldWrite) {
    expectErr =
      section.toUpperCase() + ' ' + child.pid + ': this { is: \'a\' } /debugging/\n' +
        section.toUpperCase() + ' ' + child.pid + ': num=1 str=a obj={"foo":"bar"}\n';
  }

  var err = '';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', function (c) {
    err += c;
  });

  var out = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', function (c) {
    out += c;
  });

  var didTest = false;
  child.on('close', function (c) {
    assert(!c);
    assert.strictEqual(err, expectErr);
    assert.strictEqual(out, expectOut);
    didTest = true;
  });

  process.on('exit', function () {
    assert(didTest);
  });
}


function child(section) {
  var util = require('../../util');
  var debug = util.debuglog(section);
  debug('this', { is: 'a' }, /debugging/);
  debug('num=%d str=%s obj=%j', 1, 'a', { foo: 'bar' });
  console.log('ok');
}
