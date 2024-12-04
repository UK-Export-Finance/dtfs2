import { z, ZodSchema } from 'zod';
import { getTestsForParameter, TestCase } from './get-tests-for-parameter.tests';

/**
 * This base option allows for overriding of the automatically generated getTestObjectWithUpdatedField function.
 * It is useful when looking at testing nested objects, but otherwise can be ignored
 */
type BaseOptions = {
  overrideGetTestObjectWithUpdatedField?: (newValue: unknown) => unknown;
};

export type TestCaseWithPathParameter = {
  parameterPath: string;
  options?: BaseOptions;
} & TestCase;

export const withSchemaValidationTests = <Schema extends ZodSchema>({
  schema,
  aValidPayload,
  testCases,
}: {
  schema: Schema;
  testCases: TestCaseWithPathParameter[];
  aValidPayload: () => z.infer<Schema>;
}) => {
  testCases.forEach((testCase) => {
    const { parameterPath } = testCase;

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
