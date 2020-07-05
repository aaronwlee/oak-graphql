import { defaultFieldResolver } from "../../deps.ts";
import { mapSchema, MapperKind } from '../utils/index.ts';

function decorateToCatchUndefined(fn: any, hint: string): any {
  const resolve = fn == null ? defaultFieldResolver : fn;
  return (root: any, args: any, ctx: any, info: any) => {
    const result = resolve(root, args, ctx, info);
    if (typeof result === 'undefined') {
      throw new Error(`Resolver for "${hint}" returned undefined`);
    }
    return result;
  };
}

export function addCatchUndefinedToSchema(schema: any): any {
  return mapSchema(schema, {
    [MapperKind.OBJECT_FIELD]: (fieldConfig: any, fieldName: any, typeName: any) => ({
      ...fieldConfig,
      resolve: decorateToCatchUndefined(fieldConfig.resolve, `${typeName}.${fieldName}`),
    }),
  });
}
