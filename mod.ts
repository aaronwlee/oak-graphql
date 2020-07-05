
import { GraphQLError, gql, PubSub } from "./deps.ts"

export { gql, PubSub }
export const GQLError = GraphQLError as any;
export { applyGraphQL, ApplyGraphQLOptions, ResolversProps } from "./applyGraphQL.ts";
