// MIT License

// Copyright (c) 2017 Uber Technologies, Inc.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import test from 'tape-cup';
import RPC from '../browser';

test('success status request', t => {
  const fetch = (...args) =>
    Promise.resolve({json: () => ({status: 'success', data: args})});
  const rpc = RPC({fetch})();
  t.equals(typeof rpc.request, 'function', 'has method');
  t.ok(rpc.request('test') instanceof Promise, 'has right return type');
  rpc
    .request('test')
    .then(([url, options]) => {
      t.equals(url, '/api/test', 'has right url');
      t.equals(options.method, 'POST', 'has right http method');
      t.equals(
        options.headers['Content-Type'],
        'application/json',
        'has right content-type'
      );
      t.equals(options.body, '{}', 'has right body');
      t.end();
    })
    .catch(e => {
      t.fail(e);
    });
});

test('failure status request', t => {
  const fetch = () =>
    Promise.resolve({json: () => ({status: 'failure', data: 'failure data'})});
  const rpc = RPC({fetch})();
  t.equals(typeof rpc.request, 'function', 'has method');
  const testRequest = rpc.request('test');
  t.ok(testRequest instanceof Promise, 'has right return type');
  testRequest
    .then(() => {
      t.fail(new Error('should reject promise'));
    })
    .catch(e => {
      t.equal(e, 'failure data', 'should pass failure data through');
      t.end();
    });
});
