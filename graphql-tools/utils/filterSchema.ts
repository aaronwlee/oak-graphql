import {
  GraphQLObjectType,
} from "../../deps.ts";

import { MapperKind, FieldFilter, RootFieldFilter } from './Interfaces.ts';

import { mapSchema } from './mapSchema.ts';

export function filterSchema({
  schema,
  rootFieldFilter = () => true,
  typeFilter = () => true,
  fieldFilter = () => true,
}: {
  schema: any;
  rootFieldFilter?: RootFieldFilter;
  typeFilter?: (typeName: string, type: any) => boolean;
  fieldFilter?: (typeName: string, fieldName: string) => boolean;
}): any {
  const filteredSchema: any = mapSchema(schema, {
    [MapperKind.QUERY]: (type: any) => filterRootFields(type, 'Query', rootFieldFilter),
    [MapperKind.MUTATION]: (type: any) => filterRootFields(type, 'Mutation', rootFieldFilter),
    [MapperKind.SUBSCRIPTION]: (type: any) => filterRootFields(type, 'Subscription', rootFieldFilter),
    [MapperKind.OBJECT_TYPE]: (type: any) =>
      typeFilter((type as any).name, type) ? filterObjectFields(type, (fieldFilter as any)) : null,
    [MapperKind.INTERFACE_TYPE]: (type: any) => (typeFilter((type as any).name, type) ? undefined : null),
    [MapperKind.UNION_TYPE]: (type: any) => (typeFilter((type as any).name, type) ? undefined : null),
    [MapperKind.INPUT_OBJECT_TYPE]: (type: any) => (typeFilter((type as any).name, type) ? undefined : null),
    [MapperKind.ENUM_TYPE]: (type: any) => (typeFilter((type as any).name, type) ? undefined : null),
    [MapperKind.SCALAR_TYPE]: (type: any) => (typeFilter((type as any).name, type) ? undefined : null),
  });

  return filteredSchema;
}

function filterRootFields(
  type: any,
  operation: 'Query' | 'Mutation' | 'Subscription',
  rootFieldFilter: RootFieldFilter
): any {
  const config = type.toConfig();
  Object.keys(config.fields).forEach(fieldName => {
    if (!rootFieldFilter(operation, fieldName, config.fields[fieldName])) {
      delete config.fields[fieldName];
    }
  });
  return new (GraphQLObjectType as any)(config);
}

function filterObjectFields(type: any, fieldFilter: FieldFilter): any {
  const config = type.toConfig();
  Object.keys(config.fields).forEach(fieldName => {
    if (!fieldFilter((type as any).name, fieldName, config.fields[fieldName])) {
      delete config.fields[fieldName];
    }
  });
  return new (GraphQLObjectType as any)(config);
}
