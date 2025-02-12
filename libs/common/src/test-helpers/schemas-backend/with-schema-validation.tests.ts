/* eslint-disable no-param-reassign */
import { z, ZodSchema } from 'zod';
import { withTestsForTestcase } from './with-tests-for-testcase';
import { TestCase } from './with-test-for-test-case.type';

/**
 * Options that are specific to the schema as a whole, for instance, if the schema is a partial
 */
type SchemaTestOptions = {
  isPartial?: boolean;
  isStrict?: boolean;
};

/**
 * Test cases with the path parameter, used to create the getTestObjectWithUpdatedParameter function
 */
export type TestCaseWithPathParameter = {
  parameterPath: string;
} & TestCase;

/**
 * This function orchestrates a schema's test cases.
 * It applies schema test options to all test cases, as well as adding and schema-specific tests as required.
 * @param params.schema The schema to test
 * @param params.schemaTestOptions Options that are specific to the schema as a whole, for instance, if the schema is a partial, or strict
 * @param params.aValidPayload A function that returns a valid payload for the schema
 * @param params.testCases Test cases to test
 * @see doc\schemas.md for more information
 * @example Schema test options
 * ```ts
 * const schemaTestOptions = { isPartial: true, isStrict: true }
 * ```
 * @example A valid payload
 * ```ts
 * const aValidPayload = () => ({ age: 20,
 *   _id: new ObjectId(),
 *   sessionIdentifier: 'session-identifier',
 *   teams: [{ name: 'a-valid-team-name' }]
 * })
 * ```
 *
 * @example Test case: using a primitive type
 * ```ts
 * const testCases = [{
 *   parameterPath: 'age',
 *   type: 'number', // with-number.tests will be used for age
 * }]
 * ```
 *
 * @example Test case: using a custom type
 * ```ts
 * const testCases = [{
 *   parameterPath: '_id',
 *   type: 'OBJECT_ID_SCHEMA', //  with-object-id-schema.tests will be used for _id
 * }]
 * ```
 *
 * @example Test case: using options that are available on all types
 * ```ts
 * const testCases = [{
 *   parameterPath: 'sessionIdentifier',
 *   type: 'string',
 *   options: { isOptional: true },
 * }]
 * ```
 *
 * @example Test case: using options that are available on a certain type
 * ```ts
 * const testCases = [{
 *   parameterPath: 'teams',
 *   type: 'Array',
 *   options: {
 *   // In this case, the type specific options allow us to
 *   //specify the type of each object on the array
 *     arrayTypeTestCase: {
 *       type: 'TfmTeamSchema',
 *     },
 *   },
 * }]
 * ```
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
  const schemaTestOptionsDefaults: Partial<SchemaTestOptions> = { isPartial: false, isStrict: false };

  const mergedSchemaTestOptions = {
    ...schemaTestOptionsDefaults,
    ...schemaTestOptions,
  };

  if (mergedSchemaTestOptions.isStrict) {
    describe('strict schema validation tests', () => {
      it('should fail parsing if a parameter not in the schema exists', () => {
        const { success } = schema.safeParse({ ...aValidPayload(), aFieldThatDoesNotBelong: 'a-value' });
        expect(success).toBe(false);
      });
    });
  }

  testCases.forEach((testCase) => {
    const { parameterPath } = testCase;

    // Turns parameter optional if the schema is a partial
    if (mergedSchemaTestOptions.isPartial) {
      if (!testCase.options) {
        testCase.options = {};
      }
      testCase.options.isOptional = true;
    }

    const getTestObjectWithUpdatedParameter =
      testCase.options?.overrideGetTestObjectWithUpdatedField !== undefined
        ? testCase.options.overrideGetTestObjectWithUpdatedField
        : (newValue: unknown): unknown => ({ ...aValidPayload(), [parameterPath]: newValue });

    const getUpdatedParameterFromParsedTestObject = (parsedPayload: unknown) => {
      const parsedPayloadAsRecord = parsedPayload as Record<string, unknown>;
      return parsedPayloadAsRecord[parameterPath];
    };

    describe(`${parameterPath} parameter tests`, () => {
      withTestsForTestcase({
        schema,
        testCase,
        getTestObjectWithUpdatedParameter,
        getUpdatedParameterFromParsedTestObject,
      });
    });
  });
};
