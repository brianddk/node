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

var common = require('../common');
var assert = require('assert');
var spawn = require('child_process').spawn;

var debugPort = common.PORT;
var args = ['--debug-port=' + debugPort];
var child = spawn(process.execPath, args);

child.stderr.on('data', function(data) {
  var lines = data.toString().replace(/\r/g, '').trim().split('\n');
  lines.forEach(processStderrLine);
});

setTimeout(testTimedOut, 3000);
function testTimedOut() {
  assert(false, 'test timed out.');
}

// Give the child process small amout of time to start
setTimeout(function() {
  process._debugProcess(child.pid);
}, 100);

process.on('exit', function() {
  child.kill();
});

var outputLines = [];
function processStderrLine(line) {
  console.log('> ' + line);
  outputLines.push(line);

  if (/debugger listening/.test(line)) {
    assertOutputLines();
    process.exit();
  }
}

function assertOutputLines() {
  var startLog = process.platform === 'win32'
                 ? 'Starting debugger agent.'
                 : 'Hit SIGUSR1 - starting debugger agent.';

  var expectedLines = [
    startLog,
    'debugger listening on port ' + debugPort
  ];

  assert.equal(outputLines.length, expectedLines.length);
  for (var i = 0; i < expectedLines.length; i++)
    assert.equal(outputLines[i], expectedLines[i]);

}
