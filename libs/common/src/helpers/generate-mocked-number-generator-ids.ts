import { getNowAsUtcISOString } from './date';
import { NumberGeneratorObject } from '../types';
import { USER, NUMBER_TYPE } from '../constants';

/**
 * Generates mocked number generator object
 * generates random id and masked id
 * creates an object with the generated IDs and other metadata.
 * returns the object in an array
 * @returns An array of mocked number generator objects.
 */
export const generateMockedNumberGeneratorIds = (): NumberGeneratorObject[] => {
  // prefix for ids
  const prefix = '003';

  // randomly generates a 7-digit number between 1000000 and 9999999
  const number = Math.floor(1000000 + Math.random() * 9000000);

  // generate id and masked id in number form from randomly generated number
  const id = Number(prefix + number);
  const maskedId = String(prefix + number);
  const zeroTimeStamp = true;

  const mockObject = {
    id,
    maskedId,
    type: NUMBER_TYPE.DEAL,
    createdBy: USER.DTFS,
    createdDatetime: getNowAsUtcISOString(zeroTimeStamp),
    requestingSystem: USER.DTFS,
  };

  return [mockObject];
};
