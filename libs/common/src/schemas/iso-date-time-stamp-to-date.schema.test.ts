import { withIsoDateTimeStampToDateSchemaTests } from '../test-helpers/schemas/transformation-tests';
import { ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA } from './iso-date-time-stamp-to-date.schema';

describe('ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA', () => {
  withIsoDateTimeStampToDateSchemaTests({
    schema: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue: unknown) => newValue,
  });

  it('should return a date object', () => {
    const testDateAsIsoTimeStamp = '2023-10-01T12:00:00Z';
    const { data } = ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA.safeParse(testDateAsIsoTimeStamp);

    expect(data).toEqual(new Date(testDateAsIsoTimeStamp));
  });
});
