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

import tape from 'tape-cup';
import mock from '../mock';

tape('mock with missing handler', async t => {
  const rpc = mock({handlers: {}})();
  try {
    await rpc.request('test');
  } catch (e) {
    t.equal(e.message, 'Missing RPC handler for test');
  } finally {
    t.end();
  }
});

tape('mock with no handlers', t => {
  try {
    const rpc = mock()();
    t.equal(typeof rpc.request, 'function');
  } catch (e) {
    t.ifError(e);
  } finally {
    t.end();
  }
});

tape('mock with handler', async t => {
  const rpc = mock({
    handlers: {
      test: args => {
        t.deepLooseEqual(args, {test: 'args'});
        return 10;
      },
    },
  })();
  try {
    const result = await rpc.request('test', {test: 'args'});
    t.equal(result, 10);
  } catch (e) {
    t.ifError(e);
  } finally {
    t.end();
  }
});
