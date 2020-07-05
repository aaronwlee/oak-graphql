import { isAbstractType } from "../../deps.ts";

// If we have any union or interface types throw if no there is no resolveType or isTypeOf resolvers
export function checkForResolveTypeResolver(schema: any, requireResolversForResolveType?: boolean) {
  Object.keys(schema.getTypeMap())
    .map(typeName => schema.getType(typeName))
    .forEach((type: any) => {
      if (!isAbstractType(type)) {
        return;
      }
      if (!type.resolveType) {
        if (!requireResolversForResolveType) {
          return;
        }
        throw new Error(
          `Type "${type.name}" is missing a "__resolveType" resolver. Pass false into ` +
            '"resolverValidationOptions.requireResolversForResolveType" to disable this error.'
        );
      }
    });
}
