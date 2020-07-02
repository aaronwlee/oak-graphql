import {
  Router,
  RouterContext,
} from "https://deno.land/x/oak/mod.ts";
import { graphql, GQLError } from "./deps.ts";
import { renderPlaygroundPage } from "./graphql-playground-html/render-playground-html.ts";
import { makeExecutableSchema } from "./graphql-tools/schema/makeExecutableSchema.ts";

export interface ApplyGraphQLOptions {
  path?: string;
  typeDefs: any;
  resolvers: ResolversProps;
  context?: (ctx: RouterContext) => any;
  usePlayground?: boolean;
}

export interface ResolversProps {
  Query?: any;
  Mutation?: any;
  [dynamicProperty: string]: any;
}

interface DynamicVersionRouter {
  routes: any;
  allowedMethods: any;
}

export const applyGraphQL = async ({
  path = "/graphql",
  typeDefs,
  resolvers,
  context,
  usePlayground = true,
}: ApplyGraphQLOptions): Promise<DynamicVersionRouter> => {
  const router = new Router();

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  await router.post(path, async (ctx: any) => {
    const { response, request } = ctx;
    if (request.hasBody) {
      try {
        const contextResult = context ? await context(ctx) : undefined;
        const body = (await request.body()).value;
        const result = await (graphql as any)(
          schema,
          body.query,
          resolvers,
          contextResult,
          body.variables || undefined,
          body.operationName || undefined,
        );

        if (result.errors) {
          const { errors } = result;
          response.status = 400;
          response.body = {
            data: null,
            error: Array.isArray(errors) ? errors[0] : errors,
          };
          return;
        } else if (result.data) {
          response.status = 200;
          const { data } = result;
          response.body = {
            data,
            error: null
          };
          return;
        }

        response.status = 400;
        response.body = "gql Error";
        return;
      } catch (error) {
        response.status = 500;
        response.body = {
          data: null,
          error: {
            message: error.message ? error.message : error,
          },
        }
        return;
      }
    }
  });

  await router.get(path, async (ctx: any) => {
    const { request, response } = ctx;
    if (usePlayground) {
      // perform more expensive content-type check only if necessary
      // XXX We could potentially move this logic into the GuiOptions lambda,
      // but I don't think it needs any overriding
      const prefersHTML = request.accepts("text/html");

      if (prefersHTML) {
        const playground = renderPlaygroundPage({
          endpoint: request.url.origin + path,
          subscriptionEndpoint: request.url.origin + path,
        });
        response.status = 200;
        response.body = playground;
        return;
      }
    }
  });

  return router as DynamicVersionRouter;
};
