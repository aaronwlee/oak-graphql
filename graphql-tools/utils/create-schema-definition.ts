
export function createSchemaDefinition(
  def: {
    query: string | any | null | undefined;
    mutation: string | any | null | undefined;
    subscription: string | any | null | undefined;
  },
  config?: {
    force?: boolean;
  },
): string | undefined {
  const schemaRoot: any = {};

  if (def.query) {
    schemaRoot.query = def.query.toString();
  }

  if (def.mutation) {
    schemaRoot.mutation = def.mutation.toString();
  }

  if (def.subscription) {
    schemaRoot.subscription = def.subscription.toString();
  }

  const fields = Object.keys(schemaRoot)
    .map(
      (rootType) => (schemaRoot[rootType]
        ? `${rootType}: ${schemaRoot[rootType]}`
        : null)
    )
    .filter((a) => a);

  if (fields.length) {
    return `schema { ${fields.join("\n")} }`;
  }

  if (config && config.force) {
    return ` schema { query: Query } `;
  }

  return undefined;
}
