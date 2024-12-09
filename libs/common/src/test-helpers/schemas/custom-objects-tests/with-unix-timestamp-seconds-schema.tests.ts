import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { withDefaultOptionsTests } from '../primitive-object-tests/with-default-options.tests';
import { withNumberTests } from '../primitive-object-tests';

export const withUnixTimestampSecondsSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
}: WithSchemaTestParams<Schema>) => {
  describe('with UNIX_TIMESTAMP_SECONDS_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
    });

    withNumberTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
    });

    it('should fail parsing if the parameter is not positive number', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(-1));
      expect(success).toBe(false);
    });

    it('should fail parsing if the parameter is not an int number', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(-1));
      expect(success).toBe(false);
    });
  });
};
