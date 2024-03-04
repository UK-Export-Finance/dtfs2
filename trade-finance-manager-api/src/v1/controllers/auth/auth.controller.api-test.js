const { getLoginUrl, processSsoRedirect } = require('./auth.controller');
const authProvider = require('./auth-provider');
const authService = require('./auth-service');

describe('auth controller', () => {
  const req = {};

  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
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
  });

  describe('processSsoRedirect()', () => {
    const mockProcessSsoRedirectResponse = { redirect: true };

    req.body = {
      pkceCodes: 'mock',
      authCodeRequest: 'mock',
      code: 'mock',
      state: 'mock',
    };

    beforeAll(async () => {
      authService.processSsoRedirect = jest.fn().mockResolvedValue(mockProcessSsoRedirectResponse);

      await processSsoRedirect(req, res);
    });

    it('should call authService.processSsoRedirect', () => {

      expect(authService.processSsoRedirect).toHaveBeenCalledTimes(1);
    });

    it('should call res.status and res.send', () => {
      expect(res.status).toHaveBeenCalledWith(200);

      expect(res.send).toHaveBeenCalledWith(mockProcessSsoRedirectResponse);
    });
  });
});
