import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { withDefaultOptionsTests } from '../primitive-object-tests/with-default-options.tests';

export const withIsoDateTimeStampToDateSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
}: WithSchemaTestParams<Schema>) => {
  describe('with ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
    });

    it('should fail parsing if the parameter is not a valid iso date with offset', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('2023-10-01T12:00:00'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a valid iso date with offset', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('2023-10-01T12:00:00Z'));
      expect(success).toBe(true);
    });
  });
};
