import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../types/with-schema-test.type';
import { withDefaultOptionsTests } from '../primitive-types-tests/with-default-options.tests';
import { withNumberTests } from '../primitive-types-tests';

export const withUnixTimestampSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema>) => {
  describe('with UNIX_TIMESTAMP_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
      getUpdatedParameterFromParsedTestObject,
    });

    withNumberTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
      getUpdatedParameterFromParsedTestObject,
    });

    it('should fail parsing if the parameter is not positive number', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(-1));
      expect(success).toBe(false);
    });

    it('should fail parsing if the parameter is not an int number', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(1.1));
      expect(success).toBe(false);
    });
  });
};
