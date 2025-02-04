import { withIsoDateTimeStampToDateSchemaTests } from '../test-helpers/schemas/transformation-tests';
import { ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA } from './iso-date-time-stamp-to-date.schema';

describe('ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA', () => {
  withIsoDateTimeStampToDateSchemaTests({
    schema: ISO_DATE_TIME_STAMP_TO_DATE_SCHEMA,
    getTestObjectWithUpdatedParameter: (newValue: unknown) => newValue,
    getUpdatedParameterFromParsedTestObject: (parsedTestObject) => parsedTestObject,
  });
});
