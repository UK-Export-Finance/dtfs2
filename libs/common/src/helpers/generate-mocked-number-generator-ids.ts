import { nowZeroSeconds } from './date';
import { NumberGeneratorObject } from '../types';

/**
 * Generates mocked number generator object
 * generates random id and masked id
 * creates an object with the generated IDs and other metadata.
 * returns the object in an array
 * @returns An array of mocked number generator objects.
 */
export const generateMockedNumberGeneratorIds = (): NumberGeneratorObject[] => {
  // length of id
  const length = 10;

  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  // generate random id and masked id in number form
  const id = Math.floor(Math.random() * (max - min + 1)) + min;
  const maskedIdNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  // converts maskedId to string
  const maskedId = `${maskedIdNumber}`;

  const mockObject = {
    id,
    maskedId,
    type: 1,
    createdBy: 'Portal v2/TFM',
    createdDatetime: new Date(nowZeroSeconds()).toISOString(),
    requestingSystem: 'Portal v2/TFM',
  };

  return [mockObject];
};
