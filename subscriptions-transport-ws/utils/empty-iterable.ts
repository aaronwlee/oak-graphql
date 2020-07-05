import { $$asyncIterator } from 'https://cdn.pika.dev/iterall@^1.3.0';

export const createEmptyIterable = (): any => {
  return {
    next() {
      return Promise.resolve({ value: undefined, done: true });
    },
    return() {
      return Promise.resolve({ value: undefined, done: true });
    },
    throw(e: Error) {
      return Promise.reject(e);
    },
    [$$asyncIterator]() {
      return this;
    },
  };
};