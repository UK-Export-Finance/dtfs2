import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from './with-schema-test.type';
import { getTestsForParameter, TestCase } from './get-tests-for-parameter.tests';
import { withDefaultOptionsTests } from './with-default-options.tests';

export type WithArrayTestsOptions = {
  arrayTypeTestCase: TestCase;
  isAllowEmpty?: boolean;
};

export const withArrayTests = <Schema extends ZodSchema>({
  schema,
  options,
  getTestObjectWithUpdatedField,
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
      getTestObjectWithUpdatedField,
    });

    it('should fail parsing if the parameter is not a array', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField('not an array'));
      expect(success).toBe(false);
    });

    if (arrayTestOptions.isAllowEmpty) {
      it('should pass parsing if the parameter is an empty array', () => {
        const { success } = schema.safeParse(getTestObjectWithUpdatedField([]));
        expect(success).toBe(true);
      });
    } else {
      it('should fail parsing if the parameter is an empty array', () => {
        const { success } = schema.safeParse(getTestObjectWithUpdatedField([]));
        expect(success).toBe(false);
      });
    }

    describe('when configuring the objects in the array', () => {
      getTestsForParameter({
        schema,
        testCase: arrayTestOptions.arrayTypeTestCase,
        getTestObjectWithUpdatedField: (value) => getTestObjectWithUpdatedField([value]),
      });
    });
  });
};
