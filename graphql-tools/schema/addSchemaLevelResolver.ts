import { defaultFieldResolver } from "../../deps.ts";
import { mapSchema, MapperKind } from '../utils/index.ts';

// wraps all resolvers of query, mutation or subscription fields
// with the provided function to simulate a root schema level resolver
export function addSchemaLevelResolver(schema: any, fn: any): any {
  // TODO test that schema is a schema, fn is a function
  const fnToRunOnlyOnce = runAtMostOncePerRequest(fn);
  return mapSchema(schema, {
    [MapperKind.ROOT_FIELD]: (fieldConfig, _fieldName, typeName, schema) => {
      // XXX this should run at most once per request to simulate a true root resolver
      // for graphql-js this is an approximation that works with queries but not mutations
      // XXX if the type is a subscription, a same query AST will be ran multiple times so we
      // deactivate here the runOnce if it's a subscription. This may not be optimal though...
      const subscription = schema.getSubscriptionType();
      if (subscription != null && subscription.name === typeName) {
        return {
          ...fieldConfig,
          resolve: wrapResolver(fieldConfig.resolve, fn),
        };
      }

      return {
        ...fieldConfig,
        resolve: wrapResolver(fieldConfig.resolve, fnToRunOnlyOnce),
      };
    },
  });
}

// XXX badly named function. this doesn't really wrap, it just chains resolvers...
function wrapResolver(
  innerResolver: any | undefined,
  outerResolver: any
): any {
  return (obj: any, args: any, ctx: any, info: any) =>
    resolveMaybePromise(outerResolver(obj, args, ctx, info), root => {
      if (innerResolver != null) {
        return innerResolver(root, args, ctx, info);
      }
      return defaultFieldResolver(root, args, ctx, info);
    });
}

function isPromise<T>(maybePromise: Promise<T> | T): maybePromise is Promise<T> {
  return maybePromise && typeof (maybePromise as Promise<T>).then === 'function';
}

// resolvers can be synchronous or asynchronous. if all resolvers
// in an operation return synchronously, the execution should return
// synchronously. the maybe-sync/maybe-async nature of resolvers should be
// preserved
function resolveMaybePromise<T, U>(maybePromise: Promise<T> | T, fulfillmentCallback: (value: T) => U): Promise<U> | U {
  if (isPromise(maybePromise)) {
    return maybePromise.then(fulfillmentCallback);
  }
  return fulfillmentCallback(maybePromise);
}

// XXX this function only works for resolvers
// XXX very hacky way to remember if the function
// already ran for this request. This will only work
// if people don't actually cache the operation.
// if they do cache the operation, they will have to
// manually remove the __runAtMostOnce before every request.
function runAtMostOncePerRequest(fn: any): any {
  let value: any;
  const randomNumber = Math.random();
  return (root: any, args: any, ctx: any, info: any) => {
    if (!info.operation['__runAtMostOnce']) {
      info.operation['__runAtMostOnce'] = {};
    }
    if (!info.operation['__runAtMostOnce'][randomNumber]) {
      info.operation['__runAtMostOnce'][randomNumber] = true;
      value = fn(root, args, ctx, info);
    }
    return value;
  };
}
