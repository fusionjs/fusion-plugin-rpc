/** Copyright (c) 2018 Uber Technologies, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import {createToken} from 'fusion-core';
import type {Token} from 'fusion-core';

export const RPCToken: Token<any> = createToken('RPCToken');

export type HandlerType = {[string]: (...args: any) => any};
export const RPCHandlersToken: Token<HandlerType> = createToken(
  'RPCHandlersToken'
);
export const BodyParserOptionsToken: Token<mixed> = createToken(
  'BodyParserOptionsToken'
);
