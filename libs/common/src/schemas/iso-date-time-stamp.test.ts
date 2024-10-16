import { withSchemaTests } from '../test-helpers';
import { ISO_DATE_TIME_STAMP } from './iso-date-time-stamp';

describe('ISO_DATE_TIME_STAMP', () => {
  withSchemaTests({
    successTestCases: getSuccessTestCases(),
    failureTestCases: getFailureTestCases(),
    schema: ISO_DATE_TIME_STAMP,
  });
});

function getSuccessTestCases() {
  return [{ description: 'a valid ISO date', aTestCase: () => '2024-05-17T15:35:32.496 +00:00' }];
}

function getFailureTestCases() {
  return [
    { description: 'an object', aTestCase: () => ({ An: 'object' }) },
    { description: 'an array', aTestCase: () => ['2024-05-17T15:35:32.496 +00:00'] },
    { description: 'an incorrectly formatted date', aTestCase: () => '2021-01-01T00:00:00' },
    { description: 'an incorrectly formatted date', aTestCase: () => '2024-05-17X15:35:32.496 +00:00' },
  ];
}
