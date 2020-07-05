// Abstract base class of any visitor implementation, defining the available
// visitor methods along with their parameter types, and providing a static
// helper function for determining whether a subclass implements a given
// visitor method, as opposed to inheriting one of the stubs defined here.
export abstract class SchemaVisitor {
  // All SchemaVisitor instances are created while visiting a specific
  // GraphQLSchema object, so this property holds a reference to that object,
  // in case a visitor method needs to refer to this.schema.
  public schema!: any;

  // Determine if this SchemaVisitor (sub)class implements a particular
  // visitor method.
  public static implementsVisitorMethod(methodName: string): boolean {
    if (!methodName.startsWith('visit')) {
      return false;
    }

    const method = (this.prototype as any)[methodName];
    if (typeof method !== 'function') {
      return false;
    }

    if (this.name === 'SchemaVisitor') {
      // The SchemaVisitor class implements every visitor method.
      return true;
    }

    const stub = (SchemaVisitor.prototype as any)[methodName];
    if (method === stub) {
      // If this.prototype[methodName] was just inherited from SchemaVisitor,
      // then this class does not really implement the method.
      return false;
    }

    return true;
  }

  // Concrete subclasses of SchemaVisitor should override one or more of these
  // visitor methods, in order to express their interest in handling certain
  // schema types/locations. Each method may return null to remove the given
  // type from the schema, a non-null value of the same type to update the
  // type in the schema, or nothing to leave the type as it was.

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public visitSchema(_schema: any): void {}

  public visitScalar(
    _scalar: any
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): any | void | null {}

  public visitObject(
    _object: any
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): any | void | null {}

  public visitFieldDefinition(
    _field: any,
    _details: {
      objectType: any;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): any | void | null {}

  public visitArgumentDefinition(
    _argument: any,
    _details: {
      field: any;
      objectType: any;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): any | void | null {}

  public visitInterface(
    _iface: any
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): any | void | null {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public visitUnion(_union: any): any | void | null {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public visitEnum(_type: any): any | void | null {}

  public visitEnumValue(
    _value: any,
    _details: {
      enumType: any;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): any | void | null {}

  public visitInputObject(
    _object: any
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): any | void | null {}

  public visitInputFieldDefinition(
    _field: any,
    _details: {
      objectType: any;
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  ): any | void | null {}
}
