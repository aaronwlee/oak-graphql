# Oak-GraphQL
[![nest badge](https://nest.land/badge.svg)](https://nest.land/package/oak-graphql)

A simple graphql middleware for oak deno framework.

![alt text](https://github.com/aaronwlee/oak_graphql/blob/master/playground.JPG?raw=true "Oak-GraphQL")

! Make sure your playground endpoint indicates same as your URL http://localhost:8080/graphql

![alt text](https://github.com/aaronwlee/oak_graphql/blob/master/mustsame.JPG?raw=true "Oak-GraphQL")


## Simple example
```ts

import { Application, Router, RouterContext } from "https://deno.land/x/oak@v6.2.0/mod.ts";
import { applyGraphQL, gql, GQLError } from "https://deno.land/x/oak_graphql/mod.ts";

const app = new Application();

app.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(`${ctx.request.method} ${ctx.request.url} - ${rt}`);
});

app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});

const types = gql`
type User {
  firstName: String
  lastName: String
}

input UserInput {
  firstName: String
  lastName: String
}

type ResolveType {
  done: Boolean
}

type Query {
  getUser(id: String): User 
}

type Mutation {
  setUser(input: UserInput!): ResolveType!
}
`;

const resolvers = {
  Query: {
    getUser: (parent: any, { id }: any, context: any, info: any) => {
      console.log("id", id, context);
      if(context.user === "Aaron") {
        throw new GQLError({ type: "auth error in context" })
      }
      return {
        firstName: "wooseok",
        lastName: "lee",
      };
    },
  },
  Mutation: {
    setUser: (parent: any, { input: { firstName, lastName } }: any, context: any, info: any) => {
      console.log("input:", firstName, lastName);
      return {
        done: true,
      };
    },
  },
};

const GraphQLService = await applyGraphQL<Router>({
  Router,
  typeDefs: types,
  resolvers: resolvers,
  context: (ctx: RouterContext) => {
    return { user: "Aaron" };
  }
})


app.use(GraphQLService.routes(), GraphQLService.allowedMethods());

console.log("Server start at http://localhost:8080");
await app.listen({ port: 8080 });

```

## TODO
- [ ] Add cache
- [ ] Enable the upload
- [ ] Enable the JSON scalar

## Method
### gql 
> [GraphQL-tag](https://github.com/apollographql/graphql-tag)
Parsing GraphQL queries
- `gql` A JavaScript template literal tag that parses GraphQL query strings into the standard GraphQL AST.

### GQLError
An error handler
> Example
```ts
throw new GQLError("string");
or
throw new GQLError({type: "General error", detail: "somthing critical!"});
```

### applyGraphQL
A Generator which based Attain Router class creates some middlewares for supporting the GraphQL.
> Options
- Router: oak Router module <br />Due to the version incompatible issue mentioned by (avalero)[https://github.com/avalero], I've decoupled the Router. Thanks :)
- path?: string <br /> A target path that handles the GraphQL post request (__*optional__: default as `/graphql`)
- typeDefs: any <br /> generated type tags by the `gql`
- resolvers: any <br /> An object that handles the queries and mutations
```ts
const resolvers = {
  Query: {
    getUser: (parent: any, {id}: any, context: any, info: any) => {
      // ...query handling function here
    },
  },
  Mutation: {
    addUser: (parent: any, {firstName, lastName}: any, context: any, info: any) => {
      // ...add user codes here
    },
  }
}
```
> The resolvers will be received these four parameters
> - parents: The return value of the resolver for this field's parent
> - args: An object that contains all GraphQL arguments provided for this field.
> - context: An object shared across all resolvers that are executing for a particular operation.
> - info: Contains information about the operation's execution state, including the field name, the path to the field from the root, and more.
- context?: (ctx) => any <br /> Send any objects to each resolver (__*optional__)
- usePlayground?: boolean; <br /> enable the playground at get method (__*optional__: default as `true`)
