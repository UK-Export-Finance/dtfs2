/* eslint-disable no-param-reassign */
import { z, ZodSchema } from 'zod';
import { withTestsForTestcase } from './with-tests-for-testcase';
import { TestCase } from './with-test-for-test-case.type';

/**
 * Options that are specific to the schema as a whole, for instance, if the schema is a partial
 */
type SchemaTestOptions = {
  isPartial?: boolean;
};

/**
 * Test cases with the path parameter, used to create the getTestObjectWithUpdatedField function
 */
export type TestCaseWithPathParameter = {
  parameterPath: string;
} & TestCase;

/**
 * With schema validation tests allows for the passing in of a schema, a valid payload, and test cases to test the schema.
 * It calls pre made test cases through withTestsForTestcase, after applying schema specific options and overrides
 */
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
      withTestsForTestcase({
        schema,
        testCase,
        getTestObjectWithUpdatedField,
      });
    });
  });
};
