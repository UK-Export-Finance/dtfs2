import { ISO_DATE_TIME_STAMP } from './iso-date-time-stamp';
import { withSchemaValidationTests } from './with-schema-validation.tests';

describe('ISO_DATE_TIME_STAMP', () => {
  const successTestCases = [{ description: 'a valid ISO date', testCase: '2024-05-17T15:35:32.496 +00:00' }];
  const failureTestCases = [
    { description: 'an object', testCase: { An: 'object' } },
    { description: 'an array', testCase: ['2024-05-17T15:35:32.496 +00:00'] },
    { description: 'an incorrectly formatted date', testCase: '2021-01-01T00:00:00' },
    { description: 'an incorrectly formatted date', testCase: '2024-05-17X15:35:32.496 +00:00' },
  ];

  withSchemaValidationTests({
    successTestCases,
    failureTestCases,
    schema: ISO_DATE_TIME_STAMP,
    schemaName: 'IsoDateTimeStamp',
  });
});
