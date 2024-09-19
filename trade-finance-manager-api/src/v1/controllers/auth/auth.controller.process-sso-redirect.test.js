const { processSsoRedirect } = require('./auth.controller');
const authService = require('./auth-service');

describe('auth controller', () => {
  const req = {};

  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };

  const mockError = {
    message: 'mock error message',
  };

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

    describe('when there is an error', () => {
      it('should call res.status=500 with an error message', async () => {
        authService.processSsoRedirect = jest.fn().mockRejectedValue(mockError);

        await processSsoRedirect(req, res);

        expect(res.status).toHaveBeenCalledWith(500);

        expect(res.send).toHaveBeenCalledWith({ data: mockError.message });
      });
    });
  });
});
