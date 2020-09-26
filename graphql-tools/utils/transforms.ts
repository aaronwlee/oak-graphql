import { GraphQLSchema } from "../../deps.ts";

import type { Request, Transform } from "./Interfaces.ts";

import { cloneSchema } from "./clone.ts";

export function applySchemaTransforms(
  originalSchema: any,
  transforms: Array<Transform>
): any {
  return transforms.reduce(
    (schema: any, transform: Transform) =>
      transform.transformSchema != null
        ? transform.transformSchema(cloneSchema(schema))
        : schema,
    originalSchema
  );
}

export function applyRequestTransforms(
  originalRequest: Request,
  transforms: Array<Transform>
): Request {
  return transforms.reduce(
    (request: Request, transform: Transform) =>
      transform.transformRequest != null
        ? transform.transformRequest(request)
        : request,

    originalRequest
  );
}

export function applyResultTransforms(
  originalResult: any,
  transforms: Array<Transform>
): any {
  return transforms.reduceRight(
    (result: any, transform: Transform) =>
      transform.transformResult != null
        ? transform.transformResult(result)
        : result,
    originalResult
  );
}
