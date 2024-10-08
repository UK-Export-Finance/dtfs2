import { ObjectId } from 'mongodb';
import { withSchemaValidationTests } from './with-schema-validation.tests';
import { OBJECT_ID } from './object-id';

describe('OBJECT_ID', () => {
  const successTestCases = [
    { description: 'a valid ObjectId', testCase: new ObjectId() },
    { description: 'a valid string ObjectId', testCase: '075bcd157dcb851180e02a7c' },
  ];

  const failureTestCases = [
    { description: 'a string', testCase: 'string' },
    { description: 'an object', testCase: { An: 'object' } },
    { description: 'an array', testCase: ['array'] },
  ];

  withSchemaValidationTests({
    successTestCases,
    failureTestCases,
    schema: OBJECT_ID,
    schemaName: 'OBJECT_ID',
  });
});
