import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../types/with-schema-test.type';
import { withDefaultOptionsTests } from '../primitive-types-tests/with-default-options.tests';

export const withEntraIdEmailSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema>) => {
  describe('with withEntraIdEmailSchemaTests tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
      getUpdatedParameterFromParsedTestObject,
    });

    it('should fail parsing if the parameter is not a null', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(null));
      expect(success).toBe(false);
    });

    it('should fail parsing if the parameter is not a undefined', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(undefined));
      expect(success).toBe(false);
    });

    it('should fail parsing if the parameter is not a valid email address', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('@ukexportfinance.gov.uk'));
      expect(success).toBe(false);
    });

    it('should fail parsing if the parameter is missing a domain', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('not-a-valid-email-address'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a valid email address', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('test1@ukexportfinance.gov.uk'));
      expect(success).toBe(true);
    });
  });
};
