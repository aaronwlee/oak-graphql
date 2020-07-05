import { defaultFieldResolver } from "../../deps.ts";

export function chainResolvers(resolvers: Array<any>) {
  return (root: any, args: { [argName: string]: any }, ctx: any, info: any) =>
    resolvers.reduce((prev, curResolver) => {
      if (curResolver != null) {
        return curResolver(prev, args, ctx, info);
      }

      return defaultFieldResolver(prev, args, ctx, info);
    }, root);
}
