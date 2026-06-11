const { HttpStatusCode } = require('axios');
const { getPortalBankList } = require('./portal-bank-list.controller');
const api = require('../api');

jest.mock('../api');

const getMockResponse = () => {
  const res = { status: jest.fn(), send: jest.fn() };
  res.status.mockReturnValue(res);
  res.send.mockReturnValue(res);
  return res;
};

describe('getPortalBankList', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  describe('when the central API returns a list of banks', () => {
    const banks = [
      { _id: 'bank-1', name: 'Bank 1', order: 1 },
      { _id: 'bank-2', name: 'Bank 2', order: 2 },
    ];

    beforeEach(() => {
      jest.mocked(api.getPortalBankList).mockResolvedValue(banks);
    });

    it('should respond with a 200 and the list of banks', async () => {
      const res = getMockResponse();

      await getPortalBankList({}, res);

      expect(res.status).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
      expect(res.send).toHaveBeenCalledTimes(1);
      expect(res.send).toHaveBeenCalledWith(banks);
    });
  });

  describe('when the central API returns an empty list', () => {
    beforeEach(() => {
      jest.mocked(api.getPortalBankList).mockResolvedValue([]);
    });

    it('should respond with a 200 and an empty array', async () => {
      const res = getMockResponse();

      await getPortalBankList({}, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.Ok);
      expect(res.send).toHaveBeenCalledWith([]);
    });
  });

  describe('when the central API throws an axios error with a response status', () => {
    const axiosError = Object.assign(new Error('Bad Gateway'), {
      isAxiosError: true,
      response: { status: HttpStatusCode.BadGateway },
    });

    beforeEach(() => {
      jest.mocked(api.getPortalBankList).mockRejectedValue(axiosError);
    });

    it('should respond with the error status and a generic error body', async () => {
      const res = getMockResponse();

      await getPortalBankList({}, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.BadGateway);
      expect(res.send).toHaveBeenCalledWith({
        status: HttpStatusCode.BadGateway,
        message: 'Failed to get portal bank list',
      });
    });

    it('should log the error to console.error', async () => {
      const res = getMockResponse();

      await getPortalBankList({}, res);

      expect(console.error).toHaveBeenCalledWith('%s %o', 'Failed to get portal bank list', axiosError);
    });
  });

  describe('when the central API throws a non-axios error', () => {
    const unknownError = new Error('Network down');

    beforeEach(() => {
      jest.mocked(api.getPortalBankList).mockRejectedValue(unknownError);
    });

    it('should respond with a 500 and a generic error body', async () => {
      const res = getMockResponse();

      await getPortalBankList({}, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
      expect(res.send).toHaveBeenCalledWith({
        status: HttpStatusCode.InternalServerError,
        message: 'Failed to get portal bank list',
      });
    });
  });
});
