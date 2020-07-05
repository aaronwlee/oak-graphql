import { parse, Kind, Source as GraphQLSource } from "../../deps.ts";

export function parseGraphQLSDL(location: string, rawSDL: string, options: any) {
  let document: any;
  try {
    document = parse(new (GraphQLSource as any)(rawSDL, location), options);
  } catch (e) {
    if (e.message.includes('EOF')) {
      document = {
        kind: Kind.DOCUMENT,
        definitions: [],
      };
    } else {
      throw e;
    }
  }
  return {
    location,
    document,
    rawSDL,
  };
}
