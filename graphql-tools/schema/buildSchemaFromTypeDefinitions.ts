import {
  parse,
  extendSchema,
  buildASTSchema,
  GraphQLSchema,
} from "../../deps.ts";

import type { ITypeDefinitions, GraphQLParseOptions } from "../utils/index.ts";

import {
  extractExtensionDefinitions,
  filterExtensionDefinitions,
} from "./extensionDefinitions.ts";
import { concatenateTypeDefs } from "./concatenateTypeDefs.ts";

export function buildSchemaFromTypeDefinitions(
  typeDefinitions: ITypeDefinitions,
  parseOptions?: GraphQLParseOptions
): any {
  const document = buildDocumentFromTypeDefinitions(
    typeDefinitions,
    parseOptions
  );
  const typesAst = filterExtensionDefinitions(document);

  const backcompatOptions = { commentDescriptions: true };
  let schema: any = buildASTSchema(typesAst, backcompatOptions);

  const extensionsAst = extractExtensionDefinitions(document);
  if (extensionsAst.definitions.length > 0) {
    schema = extendSchema(schema, extensionsAst, backcompatOptions);
  }

  return schema;
}

export function isDocumentNode(
  typeDefinitions: ITypeDefinitions
): typeDefinitions is any {
  return (typeDefinitions as any).kind !== undefined;
}

export function buildDocumentFromTypeDefinitions(
  typeDefinitions: ITypeDefinitions,
  parseOptions?: GraphQLParseOptions
): any {
  let document: any;
  if (typeof typeDefinitions === "string") {
    document = parse(typeDefinitions, parseOptions);
  } else if (Array.isArray(typeDefinitions)) {
    document = parse(concatenateTypeDefs(typeDefinitions), parseOptions);
  } else if (isDocumentNode(typeDefinitions)) {
    document = typeDefinitions;
  } else {
    const type = typeof typeDefinitions;
    throw new Error(
      `typeDefs must be a string, array or schema AST, got ${type}`
    );
  }

  return document;
}
