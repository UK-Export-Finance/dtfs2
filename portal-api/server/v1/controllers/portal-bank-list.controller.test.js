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
      { _id: '60f7f9c2e1b4a12d34c56789', name: 'Bank 1', order: 1 },
      { _id: '60f7f9c2e1b4a12d34c5678a', name: 'Bank 2', order: 2 },
    ];

    beforeEach(() => {
      jest.mocked(api.getPortalBankList).mockResolvedValue(banks);
    });

    it(`should respond with a ${HttpStatusCode.Ok} and the list of banks`, async () => {
      const res = getMockResponse();

      await getPortalBankList({}, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.Ok);
      expect(res.send).toHaveBeenNthCalledWith(1, banks);
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
      code: 'ERR_BAD_RESPONSE',
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

    it('should log a sanitized error line with status, code and message (never the full error object)', async () => {
      const res = getMockResponse();

      await getPortalBankList({}, res);

      expect(console.error).toHaveBeenNthCalledWith(
        1,
        '%s: %s (status: %s, code: %s)',
        'Failed to get portal bank list',
        'Bad Gateway',
        HttpStatusCode.BadGateway,
        'ERR_BAD_RESPONSE',
      );
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

  describe.each([
    ['null', null],
    ['undefined', undefined],
    ['a string', 'something went wrong'],
    ['a number', 500],
  ])('when the central API throws %s (non-object error)', (_label, thrown) => {
    beforeEach(() => {
      jest.mocked(api.getPortalBankList).mockRejectedValue(thrown);
    });

    it(`should respond with a ${HttpStatusCode.InternalServerError} without throwing inside the catch`, async () => {
      const res = getMockResponse();

      await getPortalBankList({}, res);

      expect(res.status).toHaveBeenNthCalledWith(1, HttpStatusCode.InternalServerError);
      expect(res.send).toHaveBeenNthCalledWith(1, {
        status: HttpStatusCode.InternalServerError,
        message: 'Failed to get portal bank list',
      });
    });
  });
});
