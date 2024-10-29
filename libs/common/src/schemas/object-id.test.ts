import { ObjectId } from 'mongodb';
import { OBJECT_ID } from './object-id';
import { withSchemaTests } from '../test-helpers';

describe('OBJECT_ID', () => {
  withSchemaTests({
    successTestCases: getSuccessTestCases(),
    failureTestCases: getFailureTestCases(),
    schema: OBJECT_ID,
  });
});

function getSuccessTestCases() {
  return [
    { description: 'a valid ObjectId', aTestCase: () => new ObjectId() },
    { description: 'a valid string ObjectId', aTestCase: () => '075bcd157dcb851180e02a7c' },
  ];
}

function getFailureTestCases() {
  return [
    { description: 'a string', aTestCase: () => 'string' },
    { description: 'an object', aTestCase: () => ({ An: 'object' }) },
    { description: 'an array', aTestCase: () => ['array'] },
  ];
}
