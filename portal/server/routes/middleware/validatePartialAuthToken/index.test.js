const { when, resetAllWhenMocks } = require('jest-when');

const { validatePartialAuthToken } = require('./index');
const api = require('../../../api');

jest.mock('../../../api', () => ({
  validatePartialAuthToken: jest.fn(),
  validateToken: jest.fn(),
}));

describe('validatePartialAuthToken', () => {
  let req;
  let res;
  let next;

  beforeEach(() => {
    resetAllWhenMocks();
    req = {
      session: {
        destroy: jest.fn((callback = () => {}) => callback()),
      },
    };
    res = {
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  describe('when the session does not have a user token', () => {
    itDoesNotCallNext();
    itDestroysTheSession();
    itRedirectsToLoginPage();
  });

  describe('when the session does have a user token', () => {
    const userToken = 'a user token';
    beforeEach(() => {
      req.session.userToken = userToken;
    });

    describe('when portal api successfully validates the token as a partial 2fa token', () => {
      beforeEach(() => {
        when(api.validatePartialAuthToken).calledWith(userToken).mockResolvedValueOnce(undefined);
      });

      it('calls next', async () => {
        await validatePartialAuthToken(req, res, next);
        expect(next).toHaveBeenCalledWith();
      });

      it('does not destroy the session', async () => {
        await validatePartialAuthToken(req, res, next);
        expect(req.session.destroy).not.toHaveBeenCalled();
      });

      it('does not redirect', async () => {
        await validatePartialAuthToken(req, res, next);
        expect(res.redirect).not.toHaveBeenCalled();
      });
    });

    describe('when portal api fails to validate the token as a partial 2fa token', () => {
      beforeEach(() => {
        when(api.validatePartialAuthToken).calledWith(userToken).mockRejectedValueOnce(new Error('test error'));
      });

      itDoesNotCallNext();
      itDestroysTheSession();
      itRedirectsToLoginPage();
    });

    describe('when portal api successfully validates the token as a login complete', () => {
      beforeEach(() => {
        when(api.validatePartialAuthToken).calledWith(userToken).mockRejectedValueOnce(undefined);
        when(api.validateToken).calledWith(userToken).mockResolvedValueOnce(true);
      });

      itDoesNotCallNext();

      it('does not destroy the session', async () => {
        await validatePartialAuthToken(req, res, next);
        expect(req.session.destroy).not.toHaveBeenCalled();
      });

      it('redirects to /', async () => {
        await validatePartialAuthToken(req, res, next);
        expect(res.redirect).toHaveBeenCalledWith('/');
      });
    });
  });

  function itDoesNotCallNext() {
    it('does not call next', async () => {
      await validatePartialAuthToken(req, res, next);
      expect(next).not.toHaveBeenCalled();
    });
  }

  function itDestroysTheSession() {
    it('destroys the session', async () => {
      await validatePartialAuthToken(req, res, next);
      expect(req.session.destroy).toHaveBeenCalled();
    });
  }

  async function itRedirectsToLoginPage() {
    it('redirects to /login', async () => {
      await validatePartialAuthToken(req, res, next);
      expect(res.redirect).toHaveBeenCalledWith('/login');
    });
  }
});
