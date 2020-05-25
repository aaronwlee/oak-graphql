import { GraphQLSchema } from "../../deps.ts";
import { mapSchema, MapperKind } from '../utils/index.ts';
import { decorateWithLogger } from './decorateWithLogger.ts';
import { ILogger } from './types.ts';

export function addErrorLoggingToSchema(schema: GraphQLSchema, logger?: ILogger): GraphQLSchema {
  if (!logger) {
    throw new Error('Must provide a logger');
  }
  if (typeof logger.log !== 'function') {
    throw new Error('Logger.log must be a function');
  }
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig: any, fieldName, typeName) => ({
      ...fieldConfig,
      resolve: decorateWithLogger(fieldConfig.resolve, logger, `${typeName}.${fieldName}`),
    }),
  });
}
