import { getOperationAST } from '../../deps.ts';

export const isASubscriptionOperation = (document: any, operationName: string): boolean => {
  const operationAST = getOperationAST(document, operationName);

  return !!operationAST && operationAST.operation === 'subscription';
};