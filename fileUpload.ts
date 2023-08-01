import { GraphQLScalarType } from "./deps.ts";

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

  const formData = await parseFormData(ctx.request);

  const operations = getField(formData, 'operations');
  if(!operations) {
    throw new Error('operations not provided');
  }

  const map = getField(formData, 'map');
  if(!map) {
    throw new Error('map not provided');
  }

  // Populate operations from other fields
  for(let [key, value] of formData) {
    if(key !== 'operations' && key !== 'map') {
      const paths = map[key] as string[];
      if(paths) {
        paths.forEach(path => setPath(operations, path.split('.'), value))  
      }
    }
  }

  ctx.params.operations = operations;

  await next();

};

function getField(form: FormData, name: any) {
  const value = form.get(name) as string;
  if(value) {
    return JSON.parse(value); 
  }
}

async function parseFormData(request: Request) {
  
  const contentType = request.headers.get('content-type');

  if(!contentType || !contentType.startsWith('multipart/form-data')) {
    throw new Error('Invalid content-type');
  }

  const formData = new FormData();

  // Native FormData handles parsing for us
  formData.append('operations', '{}'); 
  formData.append('map', '{}');

  await request.formData();

  return formData;

}