import { mergeDeep, SchemaDirectiveVisitor } from "../utils/index.ts";
import { addResolversToSchema } from "./addResolversToSchema.ts";

import { attachDirectiveResolvers } from "./attachDirectiveResolvers.ts";
import { assertResolversPresent } from "./assertResolversPresent.ts";
import { addSchemaLevelResolver } from "./addSchemaLevelResolver.ts";
import { buildSchemaFromTypeDefinitions } from "./buildSchemaFromTypeDefinitions.ts";
import { addErrorLoggingToSchema } from "./addErrorLoggingToSchema.ts";
import { addCatchUndefinedToSchema } from "./addCatchUndefinedToSchema.ts";
import type { IExecutableSchemaDefinition } from "./types.ts";

export function makeExecutableSchema<TContext = any>({
  typeDefs,
  resolvers = {},
  logger,
  allowUndefinedInResolve = true,
  resolverValidationOptions = {},
  directiveResolvers,
  schemaDirectives,
  schemaTransforms = [],
  parseOptions = {},
  inheritResolversFromInterfaces = false,
}: IExecutableSchemaDefinition<TContext>) {
  // Validate and clean up arguments
  if (typeof resolverValidationOptions !== "object") {
    throw new Error("Expected `resolverValidationOptions` to be an object");
  }

  if (!typeDefs) {
    throw new Error("Must provide typeDefs");
  }

  // We allow passing in an array of resolver maps, in which case we merge them
  const resolverMap: any = Array.isArray(resolvers)
    ? resolvers.reduce(mergeDeep, {})
    : resolvers;

  // Arguments are now validated and cleaned up

  let schema = buildSchemaFromTypeDefinitions(typeDefs, parseOptions);

  schema = addResolversToSchema({
    schema,
    resolvers: resolverMap,
    resolverValidationOptions,
    inheritResolversFromInterfaces,
  });

  assertResolversPresent(schema, resolverValidationOptions);

  if (!allowUndefinedInResolve) {
    schema = addCatchUndefinedToSchema(schema);
  }

  if (logger != null) {
    schema = addErrorLoggingToSchema(schema, logger);
  }

  if (typeof (resolvers as any)["__schema"] === "function") {
    // TODO a bit of a hack now, better rewrite generateSchema to attach it there.
    // not doing that now, because I'd have to rewrite a lot of tests.
    schema = addSchemaLevelResolver(
      schema,
      (resolvers as any)["__schema"] as any
    );
  }

  schemaTransforms.forEach((schemaTransform) => {
    schema = schemaTransform(schema);
  });

  // directive resolvers are implemented using SchemaDirectiveVisitor.visitSchemaDirectives
  // schema visiting modifies the schema in place
  if (directiveResolvers != null) {
    schema = attachDirectiveResolvers(schema, directiveResolvers);
  }

  if (schemaDirectives != null) {
    SchemaDirectiveVisitor.visitSchemaDirectives(schema, schemaDirectives);
  }

  return schema;
}
