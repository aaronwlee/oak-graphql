import { getNamedType, isObjectType } from "../../deps.ts";

import type { IFieldIteratorFn } from "./Interfaces.ts";

export function forEachField(schema: any, fn: IFieldIteratorFn): void {
  const typeMap = schema.getTypeMap();
  Object.keys(typeMap).forEach((typeName) => {
    const type = typeMap[typeName];

    // TODO: maybe have an option to include these?
    if (
      !(getNamedType(type) as any).name.startsWith("__") &&
      isObjectType(type)
    ) {
      const fields = type.getFields();
      Object.keys(fields).forEach((fieldName) => {
        const field = fields[fieldName];
        fn(field, typeName, fieldName);
      });
    }
  });
}
