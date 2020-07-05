import { isObjectType } from "../../deps.ts";

export function getImplementingTypes(interfaceName: string, schema: any): string[] {
  const allTypesMap = schema.getTypeMap();
  const result: string[] = [];

  for (const graphqlTypeName in allTypesMap) {
    const graphqlType = allTypesMap[graphqlTypeName];
    if (isObjectType(graphqlType)) {
      const allInterfaces = graphqlType.getInterfaces();

      if (allInterfaces.find((int: any) => int.name === interfaceName)) {
        result.push(graphqlType.name);
      }
    }
  }

  return result;
}
