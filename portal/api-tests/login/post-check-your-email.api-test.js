jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../../server/routes/middleware/csrf', () => ({
  ...(jest.requireActual('../../server/routes/middleware/csrf')),
  csrfToken: () => (req, res, next) => next(),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  validatePartialAuthToken: jest.fn(),
}));
const { when, resetAllWhenMocks } = require('jest-when');
const extractSessionCookie = require('../helpers/extractSessionCookie');
const mockLogin = require('../helpers/login');
const app = require('../../server/createApp');
const { post } = require('../create-api').createApi(app);
const { withPartial2faAuthValidationApiTests } = require('../common-tests/partial-2fa-auth-validation-api-tests');
const { validatePartialAuthToken, sendSignInLink, login } = require('../../server/api');

describe('POST /login/check-your-email', () => {
  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers) => post({}, headers).to('/login/check-your-email'),
    validateResponseWasSuccessful: (response) => {
      expect(response.status).toBe(302);
      expect(response.headers.location).toBe('/login/check-your-email');
    },
  });

  describe('with a valid partial auth token', () => {
    const partialAuthToken = 'partial auth token';
    const email = 'email@example.com';
    const password = 'a password';

    let sessionCookie;
    beforeEach(async () => {
      resetAllWhenMocks();
      jest.resetAllMocks();
      login.mockImplementation(mockLogin(partialAuthToken));
      sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);
      sendSignInLink.mockReset();
      when(validatePartialAuthToken)
        .calledWith(partialAuthToken)
        .mockResolvedValueOnce();
    });

    describe('when the user does not have a session', () => {
      it('does not send a new sign in link', async () => {
        await post().to('/login/check-your-email');

        expect(sendSignInLink).not.toHaveBeenCalled();
      });

      it('redirects the user to /login', async () => {
        const { status, headers } = await post().to('/login/check-your-email');

        expect(status).toBe(302);
        expect(headers.location).toBe('/login');
      });
    });

    describe('when the user has a session', () => {
      describe('the first time it is called in the session', () => {
        itRedirectsTheUserToCheckYourEmail();
        itSendsANewSignInLink();
      });

      describe('the second time it is called in the session', () => {
        beforeEach(async () => {
          await post({}, { Cookie: sessionCookie }).to('/login/check-your-email');
          sendSignInLink.mockReset();
        });

        itRedirectsTheUserToCheckYourEmail();
        itSendsANewSignInLink();
      });

      describe('the third time it is called in the session', () => {
        beforeEach(async () => {
          await post({}, { Cookie: sessionCookie }).to('/login/check-your-email');
          await post({}, { Cookie: sessionCookie }).to('/login/check-your-email');
          sendSignInLink.mockReset();
        });

        it('does not send a new sign in link', async () => {
          await post({}, { Cookie: sessionCookie }).to('/login/check-your-email');

          expect(sendSignInLink).not.toHaveBeenCalled();
        });

        it('returns a 403 error', async () => {
          const { status } = await post({}, { Cookie: sessionCookie }).to('/login/check-your-email');

          expect(status).toBe(403);
        });
      });
    });

    function itRedirectsTheUserToCheckYourEmail() {
      it('redirects the user to /login/check-your-email', async () => {
        const { status, headers } = await post({}, { Cookie: sessionCookie }).to('/login/check-your-email');

        expect(status).toBe(302);
        expect(headers.location).toBe('/login/check-your-email');
      });
    }

    function itSendsANewSignInLink() {
      it('sends a new sign in link', async () => {
        await post({}, { Cookie: sessionCookie }).to('/login/check-your-email');

        expect(sendSignInLink).toHaveBeenCalledTimes(1);
        expect(sendSignInLink).toHaveBeenCalledWith(partialAuthToken);
      });
    }
  });
});
