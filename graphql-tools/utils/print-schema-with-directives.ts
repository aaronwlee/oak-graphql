import {
  print,
  printType,
  Kind,
  isSpecifiedScalarType,
  isIntrospectionType,
  isScalarType,
  parse,
} from "../../deps.ts";
import type { SchemaPrintOptions } from "./types.ts";
import { createSchemaDefinition } from "./create-schema-definition.ts";

export function printSchemaWithDirectives(
  schema: any,
  _options: SchemaPrintOptions = {}
): string {
  const typesMap = schema.getTypeMap();

  const result: any = [getSchemaDefinition(schema)];

  for (const typeName in typesMap) {
    const type = typesMap[typeName];
    const isPredefinedScalar =
      isScalarType(type) && isSpecifiedScalarType(type);
    const isIntrospection = isIntrospectionType(type);

    if (isPredefinedScalar || isIntrospection) {
      continue;
    }

    // KAMIL: we might want to turn on descriptions in future
    result.push(print(correctType(typeName, typesMap)?.astNode));
  }

  const directives = schema.getDirectives();
  for (const directive of directives) {
    if (directive.astNode) {
      result.push(print(directive.astNode));
    }
  }

  return result.join("\n");
}

function extendDefinition(type: any): any {
  switch (type.astNode.kind) {
    case Kind.OBJECT_TYPE_DEFINITION:
      return {
        ...type.astNode,
        fields: type.astNode.fields.concat(
          (type.extensionASTNodes as ReadonlyArray<any>).reduce(
            (fields, node: any) => fields.concat(node.fields),
            []
          )
        ),
      };
    case Kind.INPUT_OBJECT_TYPE_DEFINITION:
      return {
        ...type.astNode,
        fields: type.astNode.fields.concat(
          (type.extensionASTNodes as ReadonlyArray<any>).reduce(
            (fields, node: any) => fields.concat(node.fields),
            []
          )
        ),
      };
    default:
      return type.astNode;
  }
}

function correctType<
  TMap extends { [key: string]: any },
  TName extends keyof TMap
>(typeName: TName, typesMap: TMap): any {
  const type = typesMap[typeName];

  type.name = typeName.toString();

  if (type.astNode && type.extensionASTNodes) {
    type.astNode = type.extensionASTNodes
      ? extendDefinition(type)
      : type.astNode;
  }
  const doc: any = (parse as any)((printType as any)(type));
  const fixedAstNode: any = doc.definitions[0] as any;
  const originalAstNode: any = type?.astNode;
  if (originalAstNode) {
    (fixedAstNode.directives as any[]) = originalAstNode?.directives as any[];
    if ("fields" in fixedAstNode && "fields" in originalAstNode) {
      for (const fieldDefinitionNode of fixedAstNode.fields) {
        const originalFieldDefinitionNode: any = (originalAstNode.fields as any).find(
          (field: any) => field.name.value === fieldDefinitionNode.name.value
        );
        (fieldDefinitionNode.directives as any[]) = originalFieldDefinitionNode?.directives as any[];
        if (
          "arguments" in fieldDefinitionNode &&
          "arguments" in originalFieldDefinitionNode
        ) {
          for (const argument of fieldDefinitionNode.arguments) {
            const originalArgumentNode: any = (originalFieldDefinitionNode as any).arguments?.find(
              (arg: any) => arg.name.value === argument.name.value
            );
            (argument.directives as any[]) = originalArgumentNode.directives as any[];
          }
        }
      }
    } else if ("values" in fixedAstNode && "values" in originalAstNode) {
      for (const valueDefinitionNode of fixedAstNode.values) {
        const originalValueDefinitionNode = (originalAstNode.values as any[]).find(
          (valueNode) => valueNode.name.value === valueDefinitionNode.name.value
        );
        (valueDefinitionNode.directives as any[]) = originalValueDefinitionNode?.directives as any[];
      }
    }
  }
  type.astNode = fixedAstNode;

  return type;
}

function getSchemaDefinition(schema: any) {
  if (
    !(Object.getOwnPropertyDescriptor(schema, "astNode") as any).get &&
    schema.astNode
  ) {
    return print(schema.astNode);
  } else {
    return createSchemaDefinition({
      query: schema.getQueryType(),
      mutation: schema.getMutationType(),
      subscription: schema.getSubscriptionType(),
    });
  }
}
