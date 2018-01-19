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
