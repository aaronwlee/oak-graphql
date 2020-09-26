import { GraphQLError, gql, PubSub } from "./deps.ts";

export { gql, PubSub };
export const GQLError = GraphQLError as any;
export { applyGraphQL } from "./applyGraphQL.ts";
export type { ApplyGraphQLOptions, ResolversProps } from "./applyGraphQL.ts";
