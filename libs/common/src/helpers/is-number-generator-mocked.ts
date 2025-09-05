import * as dotenv from 'dotenv';
import { stringToBoolean } from './string-to-boolean';

dotenv.config();

/**
 * checks if number generator key is mocked
 * if numberGeneratorKey is mocked, MOCK_E2E_NUMBER_GENERATOR env var will be set to 'true'
 * @returns true if MOCK_E2E_NUMBER_GENERATOR is set to 'true', false otherwise
 */
export const isNumberGeneratorMocked = (): boolean => {
  const mockNumberGeneratorKey: string | undefined = process.env.MOCK_E2E_NUMBER_GENERATOR;

  // if either key is missing, return false
  if (!mockNumberGeneratorKey) {
    return false;
  }

  return stringToBoolean(mockNumberGeneratorKey);
};
