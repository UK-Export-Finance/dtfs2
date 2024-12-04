/* eslint-disable no-param-reassign */
import { z, ZodSchema } from 'zod';
import { getTestsForParameter, TestCase } from './get-tests-for-parameter.tests';

/**
 * This base option allows for overriding of the automatically generated getTestObjectWithUpdatedField function.
 * It is useful when looking at testing nested objects, but otherwise can be ignored
 */
type BaseOptions = {
  overrideGetTestObjectWithUpdatedField?: (newValue: unknown) => unknown;
};

type SchemaTestOptions = {
  isPartial?: boolean;
};

export type TestCaseWithPathParameter = {
  parameterPath: string;
  options?: BaseOptions;
} & TestCase;

export const withSchemaValidationTests = <Schema extends ZodSchema>({
  schema,
  schemaTestOptions = {},
  aValidPayload,
  testCases,
}: {
  schema: Schema;
  schemaTestOptions?: SchemaTestOptions;
  testCases: TestCaseWithPathParameter[];
  aValidPayload: () => z.infer<Schema>;
}) => {
  const schemaTestOptionsDefaults: Partial<SchemaTestOptions> = { isPartial: false };

  const mergedSchemaTestOptions = {
    ...schemaTestOptionsDefaults,
    ...schemaTestOptions,
  };

  testCases.forEach((testCase) => {
    const { parameterPath } = testCase;

    // Turns parameter optional if the schema is a partial
    if (mergedSchemaTestOptions.isPartial) {
      if (!testCase.options) {
        testCase.options = {};
      }
      testCase.options.isOptional = true;
    }

    const getTestObjectWithUpdatedField =
      testCase.options?.overrideGetTestObjectWithUpdatedField !== undefined
        ? testCase.options.overrideGetTestObjectWithUpdatedField
        : (newValue: unknown): unknown => ({ ...aValidPayload(), [parameterPath]: newValue });

    describe(`${parameterPath} parameter tests`, () => {
      getTestsForParameter({
        schema,
        testCase,
        getTestObjectWithUpdatedField,
      });
    });
  });
};
