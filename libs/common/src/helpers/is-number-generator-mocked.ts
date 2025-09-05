import * as dotenv from 'dotenv';
import { stringToBoolean } from './string-to-boolean';

dotenv.config();

/**
 * checks if number generator key is mocked
 * if numberGeneratorKey is mocked, MOCK_E2E_NUMBER_GENERATOR env var will be set to 'true'
 * @returns true if MOCK_E2E_NUMBER_GENERATOR is set to 'true', false otherwise
 */
export const isNumberGeneratorMocked = (): boolean => {
  const { MOCK_E2E_NUMBER_GENERATOR } = process.env;
  const mockNumberGeneratorKey: boolean = stringToBoolean(MOCK_E2E_NUMBER_GENERATOR);

  return mockNumberGeneratorKey;
};
