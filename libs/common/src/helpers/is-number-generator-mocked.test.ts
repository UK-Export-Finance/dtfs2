import dotenv from 'dotenv';
import { isNumberGeneratorMocked } from './is-number-generator-mocked';

dotenv.config();

const originalProcessEnv = { ...process.env };

describe('is-number-generator-mocked', () => {
  afterAll(() => {
    process.env = { ...originalProcessEnv };
  });

  describe('when MOCK_E2E_NUMBER_GENERATOR is set to "true"', () => {
    beforeEach(() => {
      process.env.MOCK_E2E_NUMBER_GENERATOR = 'true';
    });

    it('should return true', () => {
      process.env.MOCK_E2E_NUMBER_GENERATOR = 'true';

      const result = isNumberGeneratorMocked();

      expect(result).toEqual(true);
    });
  });

  describe('when MOCK_E2E_NUMBER_GENERATOR is set to "false"', () => {
    beforeEach(() => {
      process.env = { ...originalProcessEnv };
    });

    it('should return false', () => {
      process.env.MOCK_E2E_NUMBER_GENERATOR = 'false';

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

  describe('when both MOCK_E2E_NUMBER_GENERATOR does not exist', () => {
    beforeEach(() => {
      process.env = { ...originalProcessEnv };
    });

    it('should return false', () => {
      delete process.env.MOCK_E2E_NUMBER_GENERATOR;

      const result = isNumberGeneratorMocked();

      expect(result).toEqual(false);
    });
  });
});
