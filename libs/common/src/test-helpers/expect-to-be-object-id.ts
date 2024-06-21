import { expect } from '@jest/globals';
import { ObjectId } from 'mongodb';
import './expect-to-be-object-id.d';

const toBeObjectId = (received: unknown) => {
  const validString = typeof received === 'string' && ObjectId.isValid(received);
  // eslint-disable-next-line @typescript-eslint/no-base-to-string
  const validObject = typeof received === 'object' && received && 'toString' in received && ObjectId.isValid(received.toString());

  if (validObject || validString) {
    return {
      message: () => `expected ${JSON.stringify(received)} not to be a valid ObjectId`,
      pass: true,
    };
  }
  return {
    message: () => `expected ${JSON.stringify(received)} to be a valid ObjectId`,
    pass: false,
  };
};

expect.extend({
  toBeObjectId,
});
