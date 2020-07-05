
export function inputFieldToFieldConfig(field: any): any {
  return {
    description: field.description,
    type: field.type,
    defaultValue: field.defaultValue,
    extensions: field.extensions,
    astNode: field.astNode,
  };
}

export function fieldToFieldConfig(field: any): any {
  return {
    description: field.description,
    type: field.type,
    args: argsToFieldConfigArgumentMap(field.args),
    resolve: field.resolve,
    subscribe: field.subscribe,
    deprecationReason: field.deprecationReason,
    extensions: field.extensions,
    astNode: field.astNode,
  };
}

export function argsToFieldConfigArgumentMap(args: ReadonlyArray<any>): any {
  const newArguments: any = {};
  args.forEach(arg => {
    newArguments[arg.name] = argumentToArgumentConfig(arg);
  });

  return newArguments;
}

export function argumentToArgumentConfig(arg: any): any {
  return {
    description: arg.description,
    type: arg.type,
    defaultValue: arg.defaultValue,
    extensions: arg.extensions,
    astNode: arg.astNode,
  };
}
