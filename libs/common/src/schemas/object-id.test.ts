import { ObjectId } from 'mongodb';
import { OBJECT_ID, OBJECT_ID_OR_OBJECT_ID_STRING, OBJECT_ID_STRING } from './object-id';
import { withSchemaTests } from '../test-helpers';

describe('OBJECT_ID', () => {
  withSchemaTests({
    successTestCases: getObjectIdSuccessTestCases(),
    failureTestCases: getObjectIdSharedFailureTestCases(),
    schema: OBJECT_ID,
  });

  it('should transform a valid string ObjectId to an ObjectId', () => {
    const stringObjectId = new ObjectId().toString();

    const result = OBJECT_ID.parse(stringObjectId);

    expect(result).toEqual(new ObjectId(stringObjectId));
  });
});

describe('OBJECT_ID_STRING', () => {
  withSchemaTests({
    successTestCases: getObjectIdStringSuccessTestCases(),
    failureTestCases: getObjectIdSharedFailureTestCases(),
    schema: OBJECT_ID_STRING,
  });

  it('should transform a valid ObjectId to a string', () => {
    const objectId = new ObjectId();

    const result = OBJECT_ID_STRING.parse(objectId);

    expect(result).toEqual(objectId.toString());
  });
});

describe('OBJECT_ID_OR_OBJECT_ID_STRING', () => {
  withSchemaTests({
    successTestCases: [...getObjectIdSuccessTestCases(), ...getObjectIdStringSuccessTestCases()],
    failureTestCases: getObjectIdSharedFailureTestCases(),
    schema: OBJECT_ID_OR_OBJECT_ID_STRING,
  });

  it('should not transform a valid ObjectId to a string', () => {
    const objectId = new ObjectId();

    const result = OBJECT_ID_OR_OBJECT_ID_STRING.parse(objectId);

    expect(result).toEqual(objectId);
  });

  it('should not transform a valid string ObjectId to an ObjectId', () => {
    const stringObjectId = new ObjectId().toString();

    const result = OBJECT_ID_OR_OBJECT_ID_STRING.parse(stringObjectId);

    expect(result).toEqual(stringObjectId);
  });
});

function getObjectIdSuccessTestCases() {
  return [{ description: 'a valid ObjectId', aTestCase: () => new ObjectId() }];
}

function getObjectIdStringSuccessTestCases() {
  return [{ description: 'a valid string ObjectId', aTestCase: () => '075bcd157dcb851180e02a7c' }];
}

function getObjectIdSharedFailureTestCases() {
  return [
    { description: 'a string', aTestCase: () => 'string' },
    { description: 'an object', aTestCase: () => ({ An: 'object' }) },
    { description: 'an array', aTestCase: () => ['array'] },
  ];
}
