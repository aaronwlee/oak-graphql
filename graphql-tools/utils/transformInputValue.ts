import {
  getNullableType,
  isLeafType,
  isListType,
  isInputObjectType,
} from "../../deps.ts";

type InputValueTransformer = (type: any, originalValue: any) => any;

export function transformInputValue(type: any, value: any, transformer: InputValueTransformer): any {
  if (value == null) {
    return value;
  }

  const nullableType = getNullableType(type);

  if (isLeafType(nullableType)) {
    return transformer(nullableType, value);
  } else if (isListType(nullableType)) {
    return value.map((listMember: any) => transformInputValue(nullableType.ofType, listMember, transformer));
  } else if (isInputObjectType(nullableType)) {
    const fields = nullableType.getFields();
    const newValue: any = {};
    Object.keys(value).forEach(key => {
      newValue[key] = transformInputValue(fields[key].type, value[key], transformer);
    });
    return newValue;
  }

  // unreachable, no other possible return value
}

export function serializeInputValue(type: any, value: any) {
  return transformInputValue(type, value, (t: any, v) => t.serialize(v));
}

export function parseInputValue(type: any, value: any) {
  return transformInputValue(type, value, (t: any, v) => t.parseValue(v));
}

export function parseInputValueLiteral(type: any, value: any) {
  return transformInputValue(type, value, (t: any, v) => t.parseLiteral(v, {}));
}
