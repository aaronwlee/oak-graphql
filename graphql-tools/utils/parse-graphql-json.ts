import { buildClientSchema, parse } from "../../deps.ts";
// import { GraphQLSchemaValidationOptions } from 'graphql/type/schema';
import { printSchemaWithDirectives } from "./print-schema-with-directives.ts";
import type { Source } from "./loaders.ts";
import type { SchemaPrintOptions } from "./types.ts";

function stripBOM(content: string): string {
  content = content.toString();
  // Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
  // because the buffer-to-string conversion in `fs.readFileSync()`
  // translates it to FEFF, the UTF-16 BOM.
  if (content.charCodeAt(0) === 0xfeff) {
    content = content.slice(1);
  }

  return content;
}

function parseBOM(content: string): any {
  return JSON.parse(stripBOM(content));
}

export function parseGraphQLJSON(
  location: string,
  jsonContent: string,
  options: SchemaPrintOptions & any
): Source {
  let parsedJson = parseBOM(jsonContent);

  if (parsedJson.data) {
    parsedJson = parsedJson.data;
  }

  if (parsedJson.kind === "Document") {
    const document = parsedJson;

    return {
      location,
      document,
    };
  } else if (parsedJson.__schema) {
    const schema = buildClientSchema(parsedJson, options as any);
    const rawSDL = printSchemaWithDirectives(schema, options);

    return {
      location,
      document: parse(rawSDL, options),
      rawSDL,
      schema,
    };
  }

  throw new Error(`Not valid JSON content`);
}
