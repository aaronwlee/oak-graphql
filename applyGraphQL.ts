import { graphql, gql } from "./deps.ts";
import { renderPlaygroundPage } from "./graphql-playground-html/render-playground-html.ts";
import { makeExecutableSchema } from "./graphql-tools/schema/makeExecutableSchema.ts";
import { fileUploadMiddleware, GraphQLUpload } from "./fileUpload.ts";

interface Constructable<T> {
  new (...args: any): T & OakRouter;
}

interface OakRouter {
  post: any;
  get: any;
}

export interface ApplyGraphQLOptions<T> {
  Router: Constructable<T>;
  path?: string;
  typeDefs: any;
  resolvers: ResolversProps;
  context?: (ctx: any) => any;
  usePlayground?: boolean;
}

export interface ResolversProps {
  Query?: any;
  Mutation?: any;
  [dynamicProperty: string]: any;
}

export async function applyGraphQL<T>({
  Router,
  path = "/graphql",
  typeDefs,
  resolvers,
  context,
  usePlayground = true,
}: ApplyGraphQLOptions<T>): Promise<T> {
  const router = new Router();

  const augmentedTypeDefs = Array.isArray(typeDefs) ? typeDefs : [typeDefs];
  augmentedTypeDefs.push(
    gql`
      scalar Upload
    `
  );
  if (Array.isArray(resolvers)) {
    if (resolvers.every((resolver) => !resolver.Upload)) {
      resolvers.push({ Upload: GraphQLUpload });
    }
  } else {
    if (resolvers && !resolvers.Upload) {
      resolvers.Upload = GraphQLUpload;
    }
  }

  const schema = makeExecutableSchema({
    typeDefs: augmentedTypeDefs,
    resolvers: [resolvers],
  });

  await router.post(path, fileUploadMiddleware, async (ctx: any) => {
    const { response, request } = ctx;
    if (request.hasBody) {
      try {
        const contextResult = context ? await context(ctx) : undefined;
        const body = ctx.params.operations || await request.body().value;
        const result = await (graphql as any)(
          schema,
          body.query,
          resolvers,
          contextResult,
          body.variables || undefined,
          body.operationName || undefined
        );

        response.status = 200;
        response.body = result;
        return;
      } catch (error) {
        response.status = 200;
        response.body = {
          data: null,
          errors: [
            {
              message: error.message ? error.message : error,
            },
          ],
        };
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
          subscriptionEndpoint: request.url.origin,
        });
        response.status = 200;
        response.body = playground;
        return;
      }
    }
  });

  // await router.get("/", async (ctx) => {
  //   const { request, response } = ctx;
  //   const WS = new SubscriptionServer(
  //     {
  //       schema,
  //       execute: execute as any,
  //       subscribe,
  //       onConnect: onConnect
  //         ? onConnect
  //         : (connectionParams: Object) => ({ ...connectionParams }),
  //       onDisconnect: onDisconnect,
  //       onOperation: async (
  //         message: { payload: any },
  //         connection: any,
  //       ) => {
  //         connection.formatResponse = (value: any) => value;

  //         // connection.formatError = this.requestOptions.formatError;
  //         let contextResult;
  //         try {
  //           contextResult = context ? await context(ctx) : undefined;
  //         } catch (error) {
  //           response.status = 200;
  //           response.body = {
  //             data: null,
  //             errors: [{
  //               message: error.message ? error.message : error,
  //             }],
  //           }
  //         }

  //         return { ...connection, context: contextResult };
  //       },
  //       keepAlive: undefined,
  //       validationRules: undefined
  //     },
  //   );
  // })

  // await router.get("/", async (ctx) => {
  //   if (ctx.isUpgradable) {
  //     const socket = await ctx.upgrade();
  //     socket.send("graphql-ws")
  //     await chat(socket)
  //   }
  // })

  return router;
}
