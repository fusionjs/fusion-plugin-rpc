/* eslint-env browser */

import {FetchToken, createOptionalToken} from 'fusion-tokens';
import {createPlugin} from 'fusion-core';
import {RPCHandlersToken} from './tokens';

export const RPCRoutePrefixConfigToken = createOptionalToken(
  'RPCRoutePrefixConfigToken',
  null
);

class RPC {
  constructor(fetch, prefix) {
    this.fetch = fetch;
    this.prefix = prefix;
  }

  request(rpcId, args) {
    // TODO(#3) handle args instanceof FormData
    return this.fetch(`${this.prefix}/api/${rpcId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(args || {}),
    })
      .then(r => r.json())
      .then(args => {
        const {status, data} = args;
        if (status === 'success') {
          return data;
        } else {
          return Promise.reject(data);
        }
      });
  }
}

export default createPlugin({
  deps: {
    fetch: FetchToken,
    handlers: RPCHandlersToken,
    routePrefix: RPCRoutePrefixConfigToken,
  },
  provides: deps => {
    const {fetch = window.fetch, handlers, routePrefix} = deps;

    if (__DEV__ && handlers) {
      if (Object.keys(handlers).find(h => typeof handlers[h] === 'function')) {
        const error = `Don't bundle server-side {handlers} in the client. Instead of 'const handlers = {...}', use 'const handlers = __NODE__ && {...}'`;
        throw new Error(error);
      }
    }

    const prefix =
      routePrefix != null
        ? routePrefix // this hook is mostly for testing
        : window.__ROUTE_PREFIX__ || ''; // created by fusion-core/src/server

    return () => new RPC(fetch, prefix);
  },
});
