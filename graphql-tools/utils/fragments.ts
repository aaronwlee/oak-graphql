import { Kind, parse } from "../../deps.ts";

export function concatInlineFragments(type: string, fragments: any): any {
  const fragmentSelections: Array<any> = fragments.reduce(
    (selections: any, fragment: any) => selections.concat(fragment.selectionSet.selections),
    []
  );

  const deduplicatedFragmentSelection: Array<any> = deduplicateSelection(fragmentSelections);

  return {
    kind: Kind.INLINE_FRAGMENT,
    typeCondition: {
      kind: Kind.NAMED_TYPE,
      name: {
        kind: Kind.NAME,
        value: type,
      },
    },
    selectionSet: {
      kind: Kind.SELECTION_SET,
      selections: deduplicatedFragmentSelection,
    },
  };
}

function deduplicateSelection(nodes: Array<any>): Array<any> {
  const selectionMap = nodes.reduce((map, node) => {
    switch (node.kind) {
      case 'Field': {
        if (node.alias != null) {
          if (node.alias.value in map) {
            return map;
          }

          return {
            ...map,
            [node.alias.value]: node,
          };
        }

        if (node.name.value in map) {
          return map;
        }

        return {
          ...map,
          [node.name.value]: node,
        };
      }
      case 'FragmentSpread': {
        if (node.name.value in map) {
          return map;
        }

        return {
          ...map,
          [node.name.value]: node,
        };
      }
      case 'InlineFragment': {
        if (map.__fragment != null) {
          const fragment = map.__fragment as any;

          return {
            ...map,
            __fragment: concatInlineFragments((fragment as any).typeCondition.name.value, [fragment, node]),
          };
        }

        return {
          ...map,
          __fragment: node,
        };
      }
      default: {
        return map;
      }
    }
  }, Object.create(null));

  const selection = Object.keys(selectionMap).reduce(
    (selectionList, node) => selectionList.concat(selectionMap[node]),
    []
  );

  return selection;
}

export function parseFragmentToInlineFragment(definitions: string): any {
  if (definitions.trim().startsWith('fragment')) {
    const document = (parse as any)(definitions);
    for (const definition of document.definitions) {
      if (definition.kind === Kind.FRAGMENT_DEFINITION) {
        return {
          kind: Kind.INLINE_FRAGMENT,
          typeCondition: definition.typeCondition,
          selectionSet: definition.selectionSet,
        };
      }
    }
  }

  const query = (parse as any)(`{${definitions}}`).definitions[0] as any;
  for (const selection of query.selectionSet.selections) {
    if (selection.kind === Kind.INLINE_FRAGMENT) {
      return selection;
    }
  }

  throw new Error('Could not parse fragment');
}
