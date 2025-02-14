import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../types/with-schema-test.type';
import { withDefaultOptionsTests } from '../primitive-types-tests/with-default-options.tests';
import { CURRENCY } from '../../../constants';

export const withCurrencySchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema>) => {
  describe('with CURRENCY_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
      getUpdatedParameterFromParsedTestObject,
    });

    it('should fail parsing if the parameter is not a valid currency', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('not-a-currency'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a valid currency', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(CURRENCY.GBP));
      expect(success).toBe(true);
    });
  });
};
