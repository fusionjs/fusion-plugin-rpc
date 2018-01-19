/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import {createPlugin} from 'fusion-core';
import MissingHandlerError from './missing-handler-error';
import {RPCHandlersToken} from './tokens';

class RPC {
  constructor(handlers) {
    this.handlers = handlers;
  }

  async request(method, args) {
    if (!this.handlers[method]) {
      throw new MissingHandlerError(method);
    }
    return this.handlers[method](args);
  }
}

export default createPlugin({
  deps: {
    handlers: RPCHandlersToken,
  },
  provides: ({handlers} = {}) => {
    return () => new RPC(handlers);
  },
});
