import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../types/with-schema-test.type';
import { withDefaultOptionsTests } from './with-default-options.tests';

export const withBooleanTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema>) => {
  describe('with boolean tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
      getUpdatedParameterFromParsedTestObject,
    });

    it('should fail parsing if the parameter is not a boolean', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('true'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a boolean', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(true));
      expect(success).toBe(true);
    });
  });
};
