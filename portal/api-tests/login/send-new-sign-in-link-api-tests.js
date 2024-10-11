const { when, resetAllWhenMocks } = require('jest-when');
const { ROLES } = require('@ukef/dtfs2-common');
const extractSessionCookie = require('../helpers/extractSessionCookie');
const mockLogin = require('../helpers/login');
const app = require('../../server/createApp');
const { post } = require('../create-api').createApi(app);
const { withPartial2faAuthValidationApiTests } = require('../common-tests/partial-2fa-auth-validation-api-tests');
const api = require('../../server/api');
const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');

const allRoles = Object.values(ROLES);

jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../../server/routes/middleware/csrf', () => ({
  ...jest.requireActual('../../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => false,
  validatePartialAuthToken: jest.fn(),
}));

const withSendNewSignInLinkApiTests = (endpoint) => {
  describe(`POST /login/${endpoint}`, () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/login/${endpoint}`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: '/login/check-your-email' },
    });

    withPartial2faAuthValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/login/${endpoint}`),
      validateResponseWasSuccessful: (response) => {
        expect(response.status).toEqual(302);
        expect(response.headers.location).toEqual('/login/check-your-email');
      },
    });

    describe('with a valid partial auth token', () => {
      const partialAuthToken = 'partial auth token';
      const email = 'email@example.com';
      const password = 'a password';
      const numberOfSendSignInLinkAttemptsRemaining = 1;
      let sessionCookie;
      beforeEach(async () => {
        resetAllWhenMocks();
        jest.resetAllMocks();
        api.login.mockImplementation(mockLogin(partialAuthToken));
        sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);
        when(api.validatePartialAuthToken).calledWith(partialAuthToken).mockResolvedValueOnce();
      });

      describe('when the user does not have a session', () => {
        beforeEach(() => {
          mockSuccessfulSendSignInLinkResponse();
        });

        it('does not send a new sign in link', async () => {
          api.sendSignInLink.mockClear();
          await post().to(`/login/${endpoint}`);

          expect(api.sendSignInLink).not.toHaveBeenCalled();
        });

        it('redirects the user to /login', async () => {
          const { status, headers } = await post().to(`/login/${endpoint}`);

          expect(status).toEqual(302);
          expect(headers.location).toEqual('/login');
        });
      });

      describe.each([
        {
          description: 'when a user is not blocked',
          beforeEachSetUp: () => {
            mockSuccessfulSendSignInLinkResponse();
          },
        },
        {
          description: 'when a user is blocked',
          beforeEachSetUp: () => {
            mock403SendSignInLinkResponse();
          },
        },
        {
          description: 'when sending an email fails',
          beforeEachSetUp: () => {
            mock500SendSignInLinkResponse();
          },
        },
      ])('$description', ({ beforeEachSetUp }) => {
        beforeEach(() => {
          beforeEachSetUp();
        });

        itRedirectsTheUserToCheckYourEmail();
        itSendsANewSignInLink();
      });

      function itRedirectsTheUserToCheckYourEmail() {
        it('redirects the user to /login/check-your-email', async () => {
          const { status, headers } = await post({}, { Cookie: sessionCookie }).to('/login/check-your-email');

          expect(status).toEqual(302);
          expect(headers.location).toEqual('/login/check-your-email');
        });
      }

      function itSendsANewSignInLink() {
        it('sends a new sign in link', async () => {
          api.sendSignInLink.mockClear();
          await post({}, { Cookie: sessionCookie }).to(`/login/${endpoint}`);

          expect(api.sendSignInLink).toHaveBeenCalledTimes(1);
          expect(api.sendSignInLink).toHaveBeenCalledWith(partialAuthToken);
        });
      }

      function mockSuccessfulSendSignInLinkResponse() {
        when(api.sendSignInLink).calledWith(expect.anything()).mockResolvedValue({ data: { numberOfSendSignInLinkAttemptsRemaining } });
      }

      function mockUnsuccessfulSendSignInLinkResponseWithStatusCode(statusCode) {
        const error = new Error(`Request failed with status: ${statusCode}`);
        error.response = { status: statusCode };
        when(api.sendSignInLink).calledWith(expect.anything()).mockRejectedValue(error);
      }

      function mock403SendSignInLinkResponse() {
        mockUnsuccessfulSendSignInLinkResponseWithStatusCode(403);
      }

      function mock500SendSignInLinkResponse() {
        mockUnsuccessfulSendSignInLinkResponseWithStatusCode(500);
      }
    });
  });
};

module.exports = {
  withSendNewSignInLinkApiTests,
};
