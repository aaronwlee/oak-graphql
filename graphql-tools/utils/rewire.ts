import {
  GraphQLDirective,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLList,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLScalarType,
  GraphQLUnionType,
  isInterfaceType,
  isEnumType,
  isInputObjectType,
  isListType,
  isNamedType,
  isNonNullType,
  isObjectType,
  isScalarType,
  isUnionType,
  isSpecifiedScalarType,
} from "../../deps.ts";

import { getBuiltInForStub, isNamedStub } from "./stub.ts";
import type { TypeMap } from "./Interfaces.ts";

export function rewireTypes(
  originalTypeMap: Record<string, any | null>,
  directives: ReadonlyArray<any>,
  options: {
    skipPruning: boolean;
  } = {
    skipPruning: false,
  }
): {
  typeMap: TypeMap;
  directives: Array<any>;
} {
  const newTypeMap: TypeMap = Object.create(null);

  Object.keys(originalTypeMap).forEach((typeName) => {
    const namedType = originalTypeMap[typeName];

    if (namedType == null || typeName.startsWith("__")) {
      return;
    }

    const newName = namedType.name;
    if (newName.startsWith("__")) {
      return;
    }

    if (newTypeMap[newName] != null) {
      throw new Error(`Duplicate schema type name ${newName}`);
    }

    newTypeMap[newName] = namedType;
  });

  Object.keys(newTypeMap).forEach((typeName) => {
    newTypeMap[typeName] = rewireNamedType(newTypeMap[typeName]);
  });

  const newDirectives = directives.map((directive) =>
    rewireDirective(directive)
  );

  return options.skipPruning
    ? {
        typeMap: newTypeMap,
        directives: newDirectives,
      }
    : pruneTypes(newTypeMap, newDirectives);

  function rewireDirective(directive: any): any {
    const directiveConfig = directive.toConfig();
    directiveConfig.args = rewireArgs(directiveConfig.args);
    return new (GraphQLDirective as any)(directiveConfig);
  }

  function rewireArgs(args: any): any {
    const rewiredArgs: any = {};
    Object.keys(args).forEach((argName) => {
      const arg = args[argName];
      const rewiredArgType = rewireType(arg.type);
      if (rewiredArgType != null) {
        arg.type = rewiredArgType;
        rewiredArgs[argName] = arg;
      }
    });
    return rewiredArgs;
  }

  function rewireNamedType<T extends any>(type: T) {
    if (isObjectType(type)) {
      const config = (type as any).toConfig();
      const newConfig = {
        ...config,
        fields: () => rewireFields(config.fields),
        interfaces: () => rewireNamedTypes(config.interfaces),
      };
      return new (GraphQLObjectType as any)(newConfig);
    } else if (isInterfaceType(type)) {
      const config = (type as any).toConfig();
      const newConfig: any = {
        ...config,
        fields: () => rewireFields(config.fields),
      };
      if ("interfaces" in newConfig) {
        newConfig.interfaces = () =>
          rewireNamedTypes(
            ((config as unknown) as { interfaces: Array<any> }).interfaces
          );
      }
      return new (GraphQLInterfaceType as any)(newConfig);
    } else if (isUnionType(type)) {
      const config = (type as any).toConfig();
      const newConfig = {
        ...config,
        types: () => rewireNamedTypes(config.types),
      };
      return new (GraphQLUnionType as any)(newConfig);
    } else if (isInputObjectType(type)) {
      const config = (type as any).toConfig();
      const newConfig = {
        ...config,
        fields: () => rewireInputFields(config.fields),
      };
      return new (GraphQLInputObjectType as any)(newConfig);
    } else if (isEnumType(type)) {
      const enumConfig = (type as any).toConfig();
      return new (GraphQLEnumType as any)(enumConfig);
    } else if (isScalarType(type)) {
      if (isSpecifiedScalarType(type)) {
        return type;
      }
      const scalarConfig = (type as any).toConfig();
      return new (GraphQLScalarType as any)(scalarConfig);
    }

    throw new Error(`Unexpected schema type: ${(type as unknown) as string}`);
  }

  function rewireFields(fields: any): any {
    const rewiredFields: any = {};
    Object.keys(fields).forEach((fieldName) => {
      const field: any = fields[fieldName];
      const rewiredFieldType = rewireType(field.type);
      if (rewiredFieldType != null) {
        field.type = rewiredFieldType;
        field.args = rewireArgs(field.args);
        rewiredFields[fieldName] = field;
      }
    });
    return rewiredFields;
  }

  function rewireInputFields(fields: any): any {
    const rewiredFields: any = {};
    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const rewiredFieldType = rewireType(field.type);
      if (rewiredFieldType != null) {
        field.type = rewiredFieldType;
        rewiredFields[fieldName] = field;
      }
    });
    return rewiredFields;
  }

  function rewireNamedTypes<T extends any>(namedTypes: Array<T>): Array<T> {
    const rewiredTypes: Array<T> = [];
    namedTypes.forEach((namedType) => {
      const rewiredType = rewireType(namedType);
      if (rewiredType != null) {
        rewiredTypes.push(rewiredType);
      }
    });
    return rewiredTypes;
  }

  function rewireType<T extends any>(type: any): any {
    if (isListType(type)) {
      const rewiredType = rewireType(type.ofType);
      return rewiredType != null
        ? (new (GraphQLList as any)(rewiredType) as T)
        : null;
    } else if (isNonNullType(type)) {
      const rewiredType = rewireType(type.ofType);
      return rewiredType != null
        ? (new (GraphQLNonNull as any)(rewiredType) as T)
        : null;
    } else if (isNamedType(type)) {
      let rewiredType = originalTypeMap[type.name];
      if (rewiredType === undefined) {
        rewiredType = isNamedStub(type) ? getBuiltInForStub(type) : type;
        newTypeMap[rewiredType.name] = rewiredType;
      }
      return rewiredType != null ? (newTypeMap[rewiredType.name] as T) : null;
    }

    return null;
  }
}

function pruneTypes(
  typeMap: TypeMap,
  directives: Array<any>
): {
  typeMap: TypeMap;
  directives: Array<any>;
} {
  const newTypeMap: any = {};

  const implementedInterfaces: any = {};
  Object.keys(typeMap).forEach((typeName) => {
    const namedType = typeMap[typeName];

    if ("getInterfaces" in namedType) {
      namedType.getInterfaces().forEach((iface: any) => {
        implementedInterfaces[iface.name] = true;
      });
    }
  });

  let prunedTypeMap = false;
  const typeNames: any = Object.keys(typeMap);
  for (let i = 0; i < typeNames.length; i++) {
    const typeName = typeNames[i];
    const type = typeMap[typeName];
    if (isObjectType(type) || isInputObjectType(type)) {
      // prune types with no fields
      if (Object.keys(type.getFields()).length) {
        newTypeMap[typeName] = type;
      } else {
        prunedTypeMap = true;
      }
    } else if (isUnionType(type)) {
      // prune unions without underlying types
      if (type.getTypes().length) {
        newTypeMap[typeName] = type;
      } else {
        prunedTypeMap = true;
      }
    } else if (isInterfaceType(type)) {
      // prune interfaces without fields or without implementations
      if (
        Object.keys(type.getFields()).length &&
        implementedInterfaces[type.name]
      ) {
        newTypeMap[typeName] = type;
      } else {
        prunedTypeMap = true;
      }
    } else {
      newTypeMap[typeName] = type;
    }
  }

  // every prune requires another round of healing
  return prunedTypeMap
    ? rewireTypes(newTypeMap, directives)
    : { typeMap, directives };
}
