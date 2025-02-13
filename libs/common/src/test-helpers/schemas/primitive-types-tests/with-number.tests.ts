import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../types/with-schema-test.type';
import { withDefaultOptionsTests } from './with-default-options.tests';

export const withNumberTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema>) => {
  describe('with number tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
      getUpdatedParameterFromParsedTestObject,
    });

    it('should fail parsing if the parameter is not a number', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('1'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a number', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(1));
      expect(success).toBe(true);
    });
  });
};
