import * as dotenv from 'dotenv';

dotenv.config();

/**
 * checks if number generator key is mocked
 * if numberGeneratorKey is mocked, it will have the same value as MOCK_E2E_NUMBER_GENERATOR
 * @returns true if numberGeneratorKey is the same as MOCK_E2E_NUMBER_GENERATOR
 */
export const isNumberGeneratorMocked = (): boolean => {
  const numberGeneratorKey: string = process.env.NUMBER_GENERATOR ?? '';
  const mockNumberGeneratorKey: string = process.env.MOCK_E2E_NUMBER_GENERATOR ?? '';

  return numberGeneratorKey === mockNumberGeneratorKey;
};
