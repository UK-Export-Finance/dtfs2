import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { withDefaultOptionsTests } from '../primitive-object-tests/with-default-options.tests';
import { withNumberTests } from '../primitive-object-tests';

export const withUnixTimestampSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedField,
}: WithSchemaTestParams<Schema>) => {
  describe('with UNIX_TIMESTAMP_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedField,
    });

    withNumberTests({
      schema,
      options,
      getTestObjectWithUpdatedField,
    });

    it('should fail parsing if the parameter is not positive number', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField(-1));
      expect(success).toBe(false);
    });

    it('should fail parsing if the parameter is not an int number', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedField(-1));
      expect(success).toBe(false);
    });
  });
};
