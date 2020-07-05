import { parse, Kind, getNamedType } from "../../deps.ts";

export function parseSelectionSet(selectionSet: string): any {
  const query = (parse as any)(selectionSet).definitions[0] as any;
  return query.selectionSet;
}

export function typeContainsSelectionSet(type: any, selectionSet: any): boolean {
  const fields = type.getFields();

  for (const selection of selectionSet.selections) {
    if (selection.kind === Kind.FIELD) {
      const field = fields[selection.name.value];

      if (field == null) {
        return false;
      }

      if (selection.selectionSet != null) {
        return typeContainsSelectionSet(getNamedType(field.type) as any, selection.selectionSet);
      }
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      const containsSelectionSet = typeContainsSelectionSet(type, selection.selectionSet);
      if (!containsSelectionSet) {
        return false;
      }
    }
  }

  return true;
}
