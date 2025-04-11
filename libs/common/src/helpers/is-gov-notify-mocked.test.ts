import dotenv from 'dotenv';
import { isGovNotifyMocked } from './is-gov-notify-mocked';

dotenv.config();

const originalProcessEnv = { ...process.env };

const { MOCK_E2E_GOV_NOTIFY_API_KEY } = process.env;

describe('is-gov-notify-mocked', () => {
  afterAll(() => {
    process.env = { ...originalProcessEnv };
  });

  describe('when GOV_NOTIFY_API_KEY is set to MOCK_E2E_GOV_NOTIFY_API_KEY', () => {
    beforeEach(() => {
      process.env.GOV_NOTIFY_API_KEY = MOCK_E2E_GOV_NOTIFY_API_KEY;
    });

    it('should return true', () => {
      process.env.GOV_NOTIFY_API_KEY = MOCK_E2E_GOV_NOTIFY_API_KEY;

      const result = isGovNotifyMocked();

      expect(result).toEqual(true);
    });
  });

  describe('when GOV_NOTIFY_API_KEY is NOT set to MOCK_E2E_GOV_NOTIFY_API_KEY', () => {
    beforeEach(() => {
      process.env = { ...originalProcessEnv };
    });

    it('should return false', () => {
      process.env.GOV_NOTIFY_API_KEY = 'other value';

      const result = isGovNotifyMocked();

      expect(result).toEqual(false);
    });
  });

  describe('when MOCK_E2E_GOV_NOTIFY_API_KEY does not exist', () => {
    beforeEach(() => {
      process.env = { ...originalProcessEnv };
    });

    it('should return false', () => {
      process.env.MOCK_E2E_GOV_NOTIFY_API_KEY = undefined;

      const result = isGovNotifyMocked();

      expect(result).toEqual(false);
    });
  });

  describe('when MOCK_E2E_GOV_NOTIFY_API_KEY is an empty string', () => {
    beforeEach(() => {
      process.env = { ...originalProcessEnv };
    });

    it('should return false', () => {
      process.env.MOCK_E2E_GOV_NOTIFY_API_KEY = '';

      const result = isGovNotifyMocked();

      expect(result).toEqual(false);
    });
  });
});
