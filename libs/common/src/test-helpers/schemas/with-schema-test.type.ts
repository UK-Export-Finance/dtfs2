import { ZodSchema } from 'zod';
import { DefaultOptions } from './primitive-object-tests/with-default-options.tests';

export type WithSchemaTestParams<Schema extends ZodSchema, SchemaTestOptions = false> = {
  schema: Schema;
  getTestObjectWithUpdatedParameter: (newValue: unknown) => unknown;
} & (SchemaTestOptions extends false ? { options?: Partial<DefaultOptions> } : { options: SchemaTestOptions & Partial<DefaultOptions> });
