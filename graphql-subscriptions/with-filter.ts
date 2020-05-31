import { $$asyncIterator } from "https://cdn.pika.dev/iterall@^1.3.0";

export type FilterFn = (rootValue?: any, args?: any, context?: any, info?: any) => boolean | Promise<boolean>;
export type ResolverFn = (rootValue?: any, args?: any, context?: any, info?: any) => AsyncIterator<any>;

export const withFilter = (asyncIteratorFn: ResolverFn, filterFn: FilterFn): ResolverFn => {
  return (rootValue: any, args: any, context: any, info: any): any => {
    const asyncIterator: any = asyncIteratorFn(rootValue, args, context, info);

    const getNextPromise = () => {
      return asyncIterator
        .next()
        .then((payload: any) => {
          if (payload.done === true) {
            return payload;
          }

          return Promise.resolve(filterFn(payload.value, args, context, info))
            .catch(() => false)
            .then(filterResult => {
              if (filterResult === true) {
                return payload;
              }

              // Skip the current value and wait for the next one
              return getNextPromise();
            });
        });
    };

    return {
      next() {
        return getNextPromise();
      },
      return() {
        return asyncIterator.return();
      },
      throw(error: any) {
        return asyncIterator.throw(error);
      },
      [$$asyncIterator]() {
        return this;
      },
    };
  };
};