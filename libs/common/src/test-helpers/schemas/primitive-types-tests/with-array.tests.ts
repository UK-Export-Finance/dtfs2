import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../types/with-schema-test.type';
import { withTestsForTestcase } from '../tests/with-tests-for-testcase';
import { withDefaultOptionsTests } from './with-default-options.tests';
import { TestCase } from '../test-cases/test-case';

export type WithArrayTestsOptions = {
  arrayTypeTestCase: TestCase;
  isAllowEmpty?: boolean;
};

export const withArrayTests = <Schema extends ZodSchema>({
  schema,
  options,
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema, WithArrayTestsOptions>) => {
  const arrayTestOptionsDefaults = { isAllowEmpty: true };
  const arrayTestOptions = {
    ...arrayTestOptionsDefaults,
    ...options,
  };

  describe('with array tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
      getUpdatedParameterFromParsedTestObject,
    });

    it('should fail parsing if the parameter is not a array', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('not an array'));
      expect(success).toBe(false);
    });

    if (arrayTestOptions.isAllowEmpty) {
      it('should pass parsing if the parameter is an empty array', () => {
        const { success } = schema.safeParse(getTestObjectWithUpdatedParameter([]));
        expect(success).toBe(true);
      });
    } else {
      it('should fail parsing if the parameter is an empty array', () => {
        const { success } = schema.safeParse(getTestObjectWithUpdatedParameter([]));
        expect(success).toBe(false);
      });
    }

    describe('when configuring the objects in the array', () => {
      withTestsForTestcase({
        schema,
        testCase: arrayTestOptions.arrayTypeTestCase,
        getTestObjectWithUpdatedParameter: (value) => getTestObjectWithUpdatedParameter([value]),
        getUpdatedParameterFromParsedTestObject: (parsedPayload) => getUpdatedParameterFromParsedTestObject(parsedPayload),
      });
    });
  });
};
