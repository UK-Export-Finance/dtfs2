const { getLoginUrl } = require('./auth.controller');
const authProvider = require('./auth-provider');

describe('auth controller', () => {
  const req = {};

  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };

  const mockError = {
    message: 'mock error message',
  };

  describe('getLoginUrl()', () => {
    const mockLoginUrl = 'mock-login-url';

    beforeAll(async () => {
      authProvider.getLoginUrl = jest.fn().mockResolvedValue(mockLoginUrl);

      await getLoginUrl(req, res);
    });

    it('should call authProvider.getLoginUrl', () => {
      expect(authProvider.getLoginUrl).toHaveBeenCalledTimes(1);
    });

    it('should call res.status and res.send', () => {
      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.send).toHaveBeenCalledWith(mockLoginUrl);
    });

    describe('when there is an error', () => {
      it('should call res.status=500 with an error message', async () => {
        authProvider.getLoginUrl = jest.fn().mockRejectedValue(mockError);

        await getLoginUrl(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.send).toHaveBeenCalledWith({ data: mockError.message });
      });
    });
  });
});
