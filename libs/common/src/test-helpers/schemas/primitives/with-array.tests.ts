import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from './with-schema-test.type';
import { getTestsForParameter, TestCase } from './get-tests-for-parameter.tests';
import { withDefaultOptionsTests } from './with-default-options.tests';

export type WithArrayTestsOptions = {
  arrayTypeTestCase: TestCase;
};

export const withArrayTests = <Schema extends ZodSchema>({
  schema,
  options,
  getTestObjectWithUpdatedField,
}: WithSchemaTestParams<Schema, WithArrayTestsOptions>) => {
  describe('with array tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedField,
    });

    it('should fail parsing if the parameter is not a array', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField('not an array'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is an empty array', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField([]));
      expect(success).toBe(true);
    });

    describe('when configuring the objects in the array', () => {
      getTestsForParameter({
        schema,
        testCase: options.arrayTypeTestCase,
        getTestObjectWithUpdatedField: (value) => getTestObjectWithUpdatedField([value]),
      });
    });
  });
};
