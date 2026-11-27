import { ZodType } from 'zod';
import { DefaultOptions } from '@ukef/test-helpers/schemas/primitive-types-tests/with-default-options.tests';

export type WithSchemaTestParams<Schema extends ZodType, SchemaTestOptions = false> = {
  schema: Schema;
  getTestObjectWithUpdatedParameter: (newValue: unknown) => unknown;
  getUpdatedParameterFromParsedTestObject: (parsedTestObject: unknown) => unknown;
} & (SchemaTestOptions extends false ? { options?: Partial<DefaultOptions> } : { options: SchemaTestOptions & Partial<DefaultOptions> });
