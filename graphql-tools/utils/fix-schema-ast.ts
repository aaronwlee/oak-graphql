import { buildSchema } from "../../deps.ts";
import type { SchemaPrintOptions } from "./types.ts";
import { printSchemaWithDirectives } from "./print-schema-with-directives.ts";

function buildFixedSchema(schema: any, options: any & SchemaPrintOptions) {
  return buildSchema(printSchemaWithDirectives(schema, options), {
    noLocation: true,
    ...(options || {}),
  });
}

export function fixSchemaAst(schema: any, options: any & SchemaPrintOptions) {
  let schemaWithValidAst: any;
  if (!schema.astNode) {
    Object.defineProperty(schema, "astNode", {
      get() {
        if (!schemaWithValidAst) {
          schemaWithValidAst = buildFixedSchema(schema, options);
        }
        return schemaWithValidAst.astNode;
      },
    });
  }
  if (!schema.extensionASTNodes) {
    Object.defineProperty(schema, "extensionASTNodes", {
      get() {
        if (!schemaWithValidAst) {
          schemaWithValidAst = buildFixedSchema(schema, options);
        }
        return schemaWithValidAst.extensionASTNodes;
      },
    });
  }
  return schema;
}
