import { getArgumentValues } from './getArgumentValues.ts';

export type DirectiveUseMap = { [key: string]: any };

type SchemaOrTypeNode = any

type DirectableGraphQLObject = any

export function getDirectives(schema: any, node: DirectableGraphQLObject): DirectiveUseMap {
  const schemaDirectives: ReadonlyArray<any> =
    schema && schema.getDirectives ? schema.getDirectives() : [];

  const schemaDirectiveMap = schemaDirectives.reduce((schemaDirectiveMap: any, schemaDirective: any) => {
    schemaDirectiveMap[schemaDirective.name] = schemaDirective;
    return schemaDirectiveMap;
  }, {});

  let astNodes: Array<SchemaOrTypeNode> = [];
  if (node.astNode) {
    astNodes.push(node.astNode);
  }
  if ('extensionASTNodes' in node && node.extensionASTNodes) {
    astNodes = [...astNodes, ...node.extensionASTNodes];
  }

  const result: DirectiveUseMap = {};

  astNodes.forEach(astNode => {
    if (astNode.directives) {
      astNode.directives.forEach((directive: any) => {
        const schemaDirective = schemaDirectiveMap[directive.name.value];
        if (schemaDirective) {
          const directiveValue = getDirectiveValues(schemaDirective, astNode);

          if (schemaDirective.isRepeatable) {
            if (result[schemaDirective.name]) {
              result[schemaDirective.name] = result[schemaDirective.name].concat([directiveValue]);
            } else {
              result[schemaDirective.name] = [directiveValue];
            }
          } else {
            result[schemaDirective.name] = directiveValue;
          }
        }
      });
    }
  });

  return result;
}

// graphql-js getDirectiveValues does not handle repeatable directives
function getDirectiveValues(directiveDef: any, node: SchemaOrTypeNode): any {
  if (node.directives) {
    if (directiveDef.isRepeatable) {
      const directiveNodes = node.directives.filter((directive: any) => directive.name.value === directiveDef.name);

      return directiveNodes.map((directiveNode: any) => getArgumentValues(directiveDef, directiveNode));
    }

    const directiveNode: any = node.directives.find((directive: any) => directive.name.value === directiveDef.name);

    return getArgumentValues(directiveDef, directiveNode);
  }
}
