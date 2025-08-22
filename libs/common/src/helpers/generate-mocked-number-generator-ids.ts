import { nowZeroSeconds } from './date';
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
  // number of digits to randomise
  const randomDigitsLength = 7;

  const min = 10 ** (randomDigitsLength - 1);
  const max = 10 ** randomDigitsLength - 1;

  // generate random id and masked id in number form
  const id = Number(prefix + (Math.floor(Math.random() * (max - min + 1)) + min));
  const maskedId = String(prefix + (Math.floor(Math.random() * (max - min + 1)) + min));

  const mockObject = {
    id,
    maskedId,
    type: NUMBER_TYPE.DEAL,
    createdBy: USER.DTFS,
    createdDatetime: new Date(nowZeroSeconds()).toISOString(),
    requestingSystem: USER.DTFS,
  };

  return [mockObject];
};
