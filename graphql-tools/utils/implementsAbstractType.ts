import { doTypesOverlap, isCompositeType } from "../../deps.ts";

export function implementsAbstractType(schema: any, typeA: any, typeB: any) {
  if (typeA === typeB) {
    return true;
  } else if (isCompositeType(typeA) && isCompositeType(typeB)) {
    return doTypesOverlap(schema, typeA, typeB);
  }

  return false;
}
