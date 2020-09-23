import type { IResolvers, IObjectTypeResolver } from "../utils/index.ts";

export function extendResolversFromInterfaces(
  schema: any,
  resolvers: IResolvers
): IResolvers {
  const typeNames = Object.keys({
    ...schema.getTypeMap(),
    ...resolvers,
  });

  const extendedResolvers: any = {};
  typeNames.forEach((typeName) => {
    const type: any = schema.getType(typeName);
    if ("getInterfaces" in type) {
      const allInterfaceResolvers = type
        .getInterfaces()
        .map((iFace: any) => resolvers[iFace.name])
        .filter((interfaceResolvers: any) => interfaceResolvers != null);

      extendedResolvers[typeName] = {};
      allInterfaceResolvers.forEach((interfaceResolvers: any) => {
        Object.keys(interfaceResolvers).forEach((fieldName) => {
          if (fieldName === "__isTypeOf" || !fieldName.startsWith("__")) {
            extendedResolvers[typeName][fieldName] =
              interfaceResolvers[fieldName];
          }
        });
      });

      const typeResolvers = resolvers[typeName] as Record<
        string,
        IObjectTypeResolver
      >;
      extendedResolvers[typeName] = {
        ...extendedResolvers[typeName],
        ...typeResolvers,
      };
    } else {
      const typeResolvers = resolvers[typeName];
      if (typeResolvers != null) {
        extendedResolvers[typeName] = typeResolvers;
      }
    }
  });

  return extendedResolvers;
}
