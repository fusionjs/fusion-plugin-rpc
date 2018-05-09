/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {createPlugin} from 'fusion-core';
import type {Context} from 'fusion-core';
import {UniversalEventsToken} from 'fusion-plugin-universal-events';

import MissingHandlerError from './missing-handler-error';
import {RPCHandlersToken} from './tokens';
import type {HandlerType} from './tokens.js';
import type {RPCPluginType} from './types.js';

type ExtractReturnType = <V>(() => V) => V;

class RPC {
  ctx: ?Context;
  emitter: ?$Call<ExtractReturnType, typeof UniversalEventsToken>;
  handlers: ?HandlerType;
  fetch: ?*;

  constructor(handlers: any) {
    this.handlers = handlers;
  }

  async request(method: string, args: mixed) {
    if (!this.handlers) {
      throw new Error('fusion-plugin-rpc requires `handlers`');
    }

    if (!this.handlers[method]) {
      throw new MissingHandlerError(method);
    }
    return this.handlers[method](args);
  }
}

const plugin: RPCPluginType = createPlugin({
  deps: {
    handlers: RPCHandlersToken,
  },
  provides: ({handlers} = {}) => {
    return {from: () => new RPC(handlers)};
  },
});

export default plugin;
