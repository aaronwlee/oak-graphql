import { Kind } from "../../deps.ts";

export function extractExtensionDefinitions(ast: any) {
  const extensionDefs = ast.definitions.filter(
    (def: any) =>
      def.kind === Kind.OBJECT_TYPE_EXTENSION ||
      def.kind === Kind.INTERFACE_TYPE_EXTENSION ||
      def.kind === Kind.INPUT_OBJECT_TYPE_EXTENSION ||
      def.kind === Kind.UNION_TYPE_EXTENSION ||
      def.kind === Kind.ENUM_TYPE_EXTENSION ||
      def.kind === Kind.SCALAR_TYPE_EXTENSION ||
      def.kind === Kind.SCHEMA_EXTENSION
  );

  return {
    ...ast,
    definitions: extensionDefs,
  };
}

export function filterExtensionDefinitions(ast: any) {
  const extensionDefs = ast.definitions.filter(
    (def: any) =>
      def.kind !== Kind.OBJECT_TYPE_EXTENSION &&
      def.kind !== Kind.INTERFACE_TYPE_EXTENSION &&
      def.kind !== Kind.INPUT_OBJECT_TYPE_EXTENSION &&
      def.kind !== Kind.UNION_TYPE_EXTENSION &&
      def.kind !== Kind.ENUM_TYPE_EXTENSION &&
      def.kind !== Kind.SCALAR_TYPE_EXTENSION &&
      def.kind !== Kind.SCHEMA_EXTENSION
  );

  return {
    ...ast,
    definitions: extensionDefs,
  };
}
