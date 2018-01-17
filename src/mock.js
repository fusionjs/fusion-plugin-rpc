import {Plugin} from 'fusion-core';
import MissingHandlerError from './missing-handler-error';
import {withDependencies} from 'fusion-core';
import {RPCHandlersToken} from './tokens';

export default withDependencies({
  handlers: RPCHandlersToken
})(({handlers} = {}) => {
  class RPC {
    async request(method, args) {
      if (!handlers[method]) {
        throw new MissingHandlerError(method);
      }
      return handlers[method](args);
    }
  }
  return () => new RPC();
});
