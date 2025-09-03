import dotenv from 'dotenv';
import { isNumberGeneratorMocked } from './is-number-generator-mocked';

dotenv.config();

const originalProcessEnv = { ...process.env };

const { MOCK_E2E_NUMBER_GENERATOR } = process.env;

describe('is-number-generator-mocked', () => {
  afterAll(() => {
    process.env = { ...originalProcessEnv };
  });

  describe('when NUMBER_GENERATOR is set to MOCK_E2E_NUMBER_GENERATOR', () => {
    beforeEach(() => {
      process.env.NUMBER_GENERATOR = MOCK_E2E_NUMBER_GENERATOR;
    });

    it('should return true', () => {
      process.env.NUMBER_GENERATOR = MOCK_E2E_NUMBER_GENERATOR;

      const result = isNumberGeneratorMocked();

      expect(result).toEqual(true);
    });
  });

  describe('when NUMBER_GENERATOR is NOT set to MOCK_E2E_NUMBER_GENERATOR', () => {
    beforeEach(() => {
      process.env = { ...originalProcessEnv };
    });

    it('should return false', () => {
      process.env.NUMBER_GENERATOR = 'other value';

      const result = isNumberGeneratorMocked();

      expect(result).toEqual(false);
    });
  });

  describe('when MOCK_E2E_NUMBER_GENERATOR does not exist', () => {
    beforeEach(() => {
      process.env = { ...originalProcessEnv };
    });

    it('should return false', () => {
      process.env.MOCK_E2E_NUMBER_GENERATOR = undefined;

      const result = isNumberGeneratorMocked();

      expect(result).toEqual(false);
    });
  });

  describe('when MOCK_E2E_NUMBER_GENERATOR is an empty string', () => {
    beforeEach(() => {
      process.env = { ...originalProcessEnv };
    });

    it('should return false', () => {
      process.env.MOCK_E2E_NUMBER_GENERATOR = '';

      const result = isNumberGeneratorMocked();

      expect(result).toEqual(false);
    });
  });

  describe('when both MOCK_E2E_NUMBER_GENERATOR and NUMBER_GENERATOR are undefined', () => {
    beforeEach(() => {
      process.env = { ...originalProcessEnv };
    });

    it('should return false', () => {
      process.env.MOCK_E2E_NUMBER_GENERATOR = undefined;
      process.env.NUMBER_GENERATOR = undefined;

      const result = isNumberGeneratorMocked();

      expect(result).toEqual(false);
    });
  });

  describe('when both MOCK_E2E_NUMBER_GENERATOR and NUMBER_GENERATOR are empty strings', () => {
    beforeEach(() => {
      process.env = { ...originalProcessEnv };
    });

    it('should return false', () => {
      process.env.MOCK_E2E_NUMBER_GENERATOR = '';
      process.env.NUMBER_GENERATOR = '';

      const result = isNumberGeneratorMocked();

      expect(result).toEqual(false);
    });
  });
});
