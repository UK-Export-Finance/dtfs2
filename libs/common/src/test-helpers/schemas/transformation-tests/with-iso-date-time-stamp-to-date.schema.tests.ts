import { ZodSchema } from 'zod';
import { WithSchemaTestParams } from '../with-schema-test.type';
import { withDefaultOptionsTests } from '../primitive-types-tests/with-default-options.tests';

export const withIsoDateTimeStampToDateSchemaTests = <Schema extends ZodSchema>({
  schema,
  options = {},
  getTestObjectWithUpdatedParameter,
  getUpdatedParameterFromParsedTestObject,
}: WithSchemaTestParams<Schema>) => {
  describe('with ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA tests', () => {
    withDefaultOptionsTests({
      schema,
      options,
      getTestObjectWithUpdatedParameter,
      getUpdatedParameterFromParsedTestObject,
    });

    it('should fail parsing if the parameter is not a valid iso date with offset', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('2023-10-01T12:00:00'));
      expect(success).toBe(false);
    });

    it('should pass parsing if the parameter is a valid iso date with offset', () => {
      const { success } = schema.safeParse(getTestObjectWithUpdatedParameter('2023-10-01T12:00:00Z'));
      expect(success).toBe(true);
    });

    it('should transform the string into a date object', () => {
      const testDateAsIsoTimeStamp = '2023-10-01T12:00:00Z';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { data } = schema.safeParse(getTestObjectWithUpdatedParameter(testDateAsIsoTimeStamp));
      expect(getUpdatedParameterFromParsedTestObject(data)).toEqual(new Date(testDateAsIsoTimeStamp));
    });
  });
};
