const api = require('../api');
const { getPortalBankListForLoginPage } = require('./get-portal-bank-list-for-login-page');

jest.mock('../api');

describe('getPortalBankListForLoginPage', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('when the api call succeeds', () => {
    const banks = [
      { _id: '1', name: 'Bank A', order: 1 },
      { _id: '2', name: 'Bank B', order: 2 },
    ];

    beforeEach(() => {
      jest.mocked(api.getPortalBankList).mockResolvedValue(banks);
    });

    it('should return the banks from the api', async () => {
      const result = await getPortalBankListForLoginPage();

      expect(result).toEqual(banks);
    });

    it('should not log an error', async () => {
      await getPortalBankListForLoginPage();

      expect(console.error).not.toHaveBeenCalled();
    });
  });

  describe('when the api call fails', () => {
    const error = Object.assign(new Error('Request failed with status code 503'), {
      isAxiosError: true,
      response: { status: 503 },
    });

    beforeEach(() => {
      jest.mocked(api.getPortalBankList).mockRejectedValue(error);
    });

    it('should return an empty array', async () => {
      const result = await getPortalBankListForLoginPage();

      expect(result).toEqual([]);
    });

    it('should log a redacted error message with status', async () => {
      await getPortalBankListForLoginPage();

      expect(console.error).toHaveBeenCalledWith('Failed to load portal bank list for login page: %s (status: %s)', 'Request failed with status code 503', 503);
    });
  });
});
