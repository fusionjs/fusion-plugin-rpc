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

/* eslint-env node */

import {withDependencies, withMiddleware, memoize} from 'fusion-core';
import {UniversalEventsToken} from 'fusion-plugin-universal-events';
import bodyparser from 'koa-bodyparser';
import MissingHandlerError from './missing-handler-error';
import {RPCHandlersToken} from './tokens';

const statKey = 'rpc:method';

export default withDependencies({
  emitter: UniversalEventsToken,
  handlers: RPCHandlersToken,
})(({emitter, handlers}) => {
  const parseBody = bodyparser();

  function hasHandler(method) {
    return handlers.hasOwnProperty(method);
  }

  class RPC {
    constructor(ctx) {
      // TODO(#5): update check to look for truthy ctx
      if (!ctx.headers) {
        throw new Error(
          'fusion-plugin-rpc requires `ctx`. Try using `RPC.of(ctx)`'
        );
      }
      this.ctx = ctx;
    }
    async request(method, args) {
      const startTime = ms();
      const scopedEmitter = emitter.from(this.ctx);
      if (!hasHandler(method)) {
        const e = new MissingHandlerError(method);
        if (scopedEmitter) {
          scopedEmitter.emit('rpc:error', {
            method,
            origin: 'server',
            error: e,
          });
        }
        throw e;
      }
      try {
        const result = await handlers[method](args, this.ctx);
        if (scopedEmitter) {
          scopedEmitter.emit(statKey, {
            method,
            status: 'success',
            origin: 'server',
            timing: ms() - startTime,
          });
        }
        return result;
      } catch (e) {
        if (scopedEmitter) {
          scopedEmitter.emit(statKey, {
            method,
            error: e,
            status: 'failure',
            origin: 'server',
            timing: ms() - startTime,
          });
        }
        throw e;
      }
    }
  }

  return withMiddleware(memoize(ctx => new RPC(ctx)), async (ctx, next) => {
    const scopedEmitter = emitter.from(ctx);
    if (ctx.method === 'POST' && ctx.path.startsWith(`${ctx.prefix}/api/`)) {
      const startTime = ms();
      const [, method] = ctx.path.match(/\/api\/([^/]+)/i) || [];
      if (hasHandler(method)) {
        await parseBody(ctx, () => Promise.resolve());
        try {
          const result = await handlers[method](ctx.request.body, ctx);
          ctx.body = {
            status: 'success',
            data: result,
          };
          if (scopedEmitter) {
            scopedEmitter.emit(statKey, {
              method,
              status: 'success',
              origin: 'browser',
              timing: ms() - startTime,
            });
          }
        } catch (e) {
          ctx.body = {
            status: 'failure',
            data: {
              message: e.message,
              code: e.code,
              meta: e.meta,
            },
          };
          if (scopedEmitter) {
            scopedEmitter.emit(statKey, {
              method,
              error: e,
              status: 'failure',
              origin: 'browser',
              timing: ms() - startTime,
            });
          }
        }
      } else {
        const e = new MissingHandlerError(method);
        ctx.body = {
          status: 'failure',
          data: {
            message: e.message,
            code: e.code,
          },
        };
        ctx.status = 404;
        if (scopedEmitter) {
          scopedEmitter.emit('rpc:error', {
            origin: 'browser',
            method,
            error: e,
          });
        }
      }
    }
    return next();
  });
});

function ms() {
  const [seconds, ns] = process.hrtime();
  return Math.round(seconds * 1000 + ns / 1e6);
}
