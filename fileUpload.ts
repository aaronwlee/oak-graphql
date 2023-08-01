import { GraphQLScalarType, FormData } from "./deps.ts";

export const GraphQLUpload = new GraphQLScalarType({
  name: "Upload",
  description: "The `Upload` scalar type represents a file upload.",
  parseValue: (value: any) => value,

  parseLiteral() {
    throw new Error("`Upload` scalar literal unsupported.");
  },

  serialize() {
    throw new Error("`Upload` scalar serialization unsupported.");
  },
});

// const isMultipart = (contentType: string) => {};

const setPath = (object: any, path: string[], value: any) => {
  console.log("setPath", object, path, value);
  if (!object) return;
  const [key, ...rest] = path;
  if (path.length === 1) {
    object[key] = value;
  } else if (path.length > 1) {
    if (!object[key]) {
      object[key] = {};
    }
    setPath(object[key], rest, value);
  }
};

export const fileUploadMiddleware = async (ctx: any, next: any) => {
  const boundaryRegex = /^multipart\/form-data;\sboundary=(?<boundary>.*)$/;
  const contentType = ctx.request.headers.get("content-type");
  const match = contentType && contentType.match(boundaryRegex);
  if (match) {
    const formBoundary = match.groups!.boundary;
    const formBody = ctx.request.serverRequest.body;
    try {
      const formData = await FormData.parse(formBody, formBoundary);
      const entries = Array.from(formData.entries()) as [string, string][];
      const operationsEntry = entries.find(
        (entry) => entry[0] === "operations"
      );
      if (!operationsEntry || typeof operationsEntry[1] !== "string") {
        throw new Error("operations not provided or invalid");
      }
      const operations = JSON.parse(operationsEntry[1]);

      const mapEntry = entries.find((entry) => entry[0] === "map");
      if (!mapEntry || typeof mapEntry[1] !== "string") {
        throw new Error("map not provided or invalid");
      }
      const map = JSON.parse(mapEntry[1]);

      entries.forEach(entry => {
        const [key, value] = entry;
        if (key !== "operations" && key !== "map" && map[key]) {
          const paths = map[key] as string[];
          paths.forEach((path) => setPath(operations, path.split("."), value));
        }
      });

      ctx.params.operations = operations;
    } catch (e) {
      console.log(e);
    }
  }

  return next();
};
