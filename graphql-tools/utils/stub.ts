import {
  GraphQLObjectType,
  GraphQLInterfaceType,
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLID,
  isObjectType,
  isInterfaceType,
  isInputObjectType,
  Kind,
  GraphQLList,
  GraphQLNonNull,
} from "../../deps.ts";

export function createNamedStub(name: string, type: 'object'): any;
export function createNamedStub(name: string, type: 'interface'): any;
export function createNamedStub(name: string, type: 'input'): any;
export function createNamedStub(
  name: string,
  type: any
): any {
  let constructor: any;
  if (type === 'object') {
    constructor = GraphQLObjectType;
  } else if (type === 'interface') {
    constructor = GraphQLInterfaceType;
  } else {
    constructor = GraphQLInputObjectType;
  }

  return new constructor({
    name,
    fields: {
      __fake: {
        type: GraphQLString,
      },
    },
  });
}

export function createStub(node: any, type: 'output'): any;
export function createStub(node: any, type: 'input'): any;
export function createStub(node: any, type: 'output' | 'input'): any;
export function createStub(node: any, type: any): any {
  switch (node.kind) {
    case Kind.LIST_TYPE:
      return new (GraphQLList as any)(createStub(node.type, type));
    case Kind.NON_NULL_TYPE:
      return new (GraphQLNonNull as any)(createStub(node.type, type));
    default:
      if (type === 'output') {
        return createNamedStub(node.name.value, 'object');
      }
      return createNamedStub(node.name.value, 'input');
  }
}

export function isNamedStub(type: any): boolean {
  if (isObjectType(type) || isInterfaceType(type) || isInputObjectType(type)) {
    const fields = type.getFields();
    const fieldNames = Object.keys(fields);
    return fieldNames.length === 1 && fields[fieldNames[0]].name === '__fake';
  }

  return false;
}

export function getBuiltInForStub(type: any): any {
  switch (type.name) {
    case (GraphQLInt as any).name:
      return GraphQLInt;
    case (GraphQLFloat as any).name:
      return GraphQLFloat;
    case (GraphQLString as any).name:
      return GraphQLString;
    case (GraphQLBoolean as any).name:
      return GraphQLBoolean;
    case (GraphQLID as any).name:
      return GraphQLID;
    default:
      return type;
  }
}
