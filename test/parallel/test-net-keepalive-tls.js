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
const common = require('../common');
const assert = require('assert');
const tls = require('tls');
const fixtures = require('../common/fixtures');

const options = {
  key: fixtures.readKey('rsa_private.pem'),
  cert: fixtures.readKey('rsa_cert.crt'),
  ca: fixtures.readKey('rsa_ca.crt'),
};

let serverConnection;
let clientConnection;
const echoServer = tls.createServer(options, function(connection) {
  serverConnection = connection;
  setTimeout(common.mustCall(function() {
    // Make sure both connections are still open
    assert.strictEqual(serverConnection.readyState, 'open');
    assert.strictEqual(clientConnection.readyState, 'open');
    serverConnection.end();
    clientConnection.end();
    echoServer.close();
  }, 1), common.platformTimeout(2000));
  connection.setTimeout(0);
  assert.notStrictEqual(connection.setKeepAlive, undefined);
  // Send a keepalive packet after 1000 ms
  connection.setKeepAlive(true, common.platformTimeout(1000));
  connection.on('end', function() {
    connection.end();
  });
});
echoServer.listen(0);

echoServer.on('listening', function() {
  clientConnection = tls.connect({...options, port: this.address().port});
  clientConnection.setTimeout(0);
});
