import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '@ukef/test-helpers/schemas/types/with-schema-test.type';
import { withDefaultOptionsTests } from '@ukef/test-helpers/schemas/primitive-types-tests/with-default-options.tests';

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

    it('should fail parsing if the parameter is null', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(null));
      expect(success).toBe(false);
    });

    it('should fail parsing if the parameter is undefined', () => {
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
