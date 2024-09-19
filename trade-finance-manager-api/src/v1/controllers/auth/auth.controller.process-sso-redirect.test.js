const { processSsoRedirect } = require('./auth.controller');
const authService = require('./auth-service');

describe('auth controller', () => {
  const getReq = () => ({
    body: {
      pkceCodes: 'mock',
      authCodeRequest: 'mock',
      code: 'mock',
      state: 'mock',
    },
  });

  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };

  const mockError = {
    message: 'mock error message',
  };

  describe('processSsoRedirect()', () => {
    describe('when there is a missing field', () => {
      it('should return a 400 status with error message containing the missing field', async () => {
        const req = getReq();
        delete req.body.state;

        await processSsoRedirect(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.send).toHaveBeenCalledWith('Invalid request, missing fields: state');
      });

      describe('when there are missing fields', () => {
        it('should return a 400 status with error message containing the missing field', async () => {
          const req = getReq();
          delete req.body.state;
          delete req.body.code;
          await processSsoRedirect(req, res);

          expect(res.status).toHaveBeenCalledWith(400);
          expect(res.send).toHaveBeenCalledWith(expect.stringContaining('Invalid request, missing fields:'));
          expect(res.send).toHaveBeenCalledWith(expect.stringContaining('state'));
          expect(res.send).toHaveBeenCalledWith(expect.stringContaining('code'));
        });
      });
    });

    describe('when there are no missing fields', () => {
      const req = getReq();

      const mockProcessSsoRedirectResponse = { redirect: true };

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
});
