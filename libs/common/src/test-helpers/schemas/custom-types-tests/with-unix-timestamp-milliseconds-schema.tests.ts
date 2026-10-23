import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '@ukef/test-helpers/schemas/types/with-schema-test.type';
import { withDefaultOptionsTests } from '@ukef/test-helpers/schemas/primitive-types-tests/with-default-options.tests';
import { withNumberTests } from '@ukef/test-helpers/schemas/primitive-types-tests';

export const withUnixTimestampMillisecondsSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema>) => {
  describe('with UNIX_TIMESTAMP_MILLISECONDS_SCHEMA tests', () => {
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
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter(1.2));
      expect(success).toBe(false);
    });
  });
};
