import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { withDefaultOptionsTests } from '../primitive-object-tests/with-default-options.tests';

export const withIsoDateTimeStampSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
}: WithSchemaTestParams<Schema>) => {
  describe('with ISO_DATE_TIME_STAMP_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      getTestObjectWithUpdatedParameter,
      options,
    });

    it('should fail parsing if the parameter is not a string', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(1));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a valid ISO date', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('2024-05-17T15:35:32.496 +00:00'));
      expect(success).toBe(true);
    });

    it('should fail parsing if the parameter is a incorrectly formatted ISO date', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('2021-01-01T00:00:00'));
      expect(success).toBe(false);
    });

    it('should fail parsing if the parameter is a incorrectly formatted ISO date', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('2024-05-17X15:35:32.496 +00:00'));
      expect(success).toBe(false);
    });
  });
};
