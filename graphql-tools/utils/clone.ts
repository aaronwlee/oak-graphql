import {
  GraphQLDirective,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLUnionType,
  isObjectType,
  isInterfaceType,
  isUnionType,
  isInputObjectType,
  isEnumType,
  isScalarType,
  isSpecifiedScalarType,
  isSpecifiedDirective,
} from "../../deps.ts";

import { mapSchema } from './mapSchema.ts';

export function cloneDirective(directive: any): any {
  return isSpecifiedDirective(directive) ? directive : new (GraphQLDirective as any)(directive.toConfig());
}

export function cloneType(type: any): any {
  if (isObjectType(type)) {
    const config = type.toConfig();
    return new (GraphQLObjectType as any)({
      ...config,
      interfaces: typeof config.interfaces === 'function' ? config.interfaces : config.interfaces.slice(),
    });
  } else if (isInterfaceType(type)) {
    const config = type.toConfig() as any;
    const newConfig = {
      ...config,
      interfaces: [...((typeof config.interfaces === 'function' ? config.interfaces() : config.interfaces) || [])],
    };
    return new (GraphQLInterfaceType as any)(newConfig);
  } else if (isUnionType(type)) {
    const config = type.toConfig();
    return new (GraphQLUnionType as any)({
      ...config,
      types: config.types.slice(),
    });
  } else if (isInputObjectType(type)) {
    return new (GraphQLInputObjectType as any)(type.toConfig());
  } else if (isEnumType(type)) {
    return new (GraphQLEnumType as any)(type.toConfig());
  } else if (isScalarType(type)) {
    return isSpecifiedScalarType(type) ? type : new (GraphQLScalarType as any)(type.toConfig());
  }

  throw new Error(`Invalid type ${type as string}`);
}

export function cloneSchema(schema: any): any {
  return mapSchema(schema);
}
