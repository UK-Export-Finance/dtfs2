const { HttpStatusCode } = require('axios');
const { when, resetAllWhenMocks } = require('jest-when');
const { ROLES } = require('@ukef/dtfs2-common');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const extractSessionCookie = require('../helpers/extractSessionCookie');
const mockLogin = require('../helpers/login');
const app = require('../../server/createApp');

const { post } = createApi(app);
const { withPartial2faAuthValidationApiTests } = require('../common-tests/partial-2fa-auth-validation-api-tests');
const api = require('../../server/api');
const { withRoleValidationOtpApiTests } = require('../common-tests/role-validation-with-otp-api-tests');

const allRoles = Object.values(ROLES);

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInOTP: jest.fn(),
  loginWithSignInOtp: jest.fn(),
  validatePortal2FAEnabled: jest.fn(),
  validateToken: () => false,
  validatePartialAuthToken: jest.fn(),
}));

const withSendNewOtpApiTests = (endpoint, attemptsLeft) => {
  describe(`POST /login/${endpoint}`, () => {
    withRoleValidationOtpApiTests({
      makeRequestWithHeaders: (headers) => post({ sixDigitAccessCode: '123456' }, headers).to(`/login/${endpoint}`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: '/dashboard' },
      endpoint,
      attemptsLeft,
    });

    withPartial2faAuthValidationApiTests({
      makeRequestWithHeaders: (headers) => post({ sixDigitAccessCode: '123456' }, headers).to(`/login/${endpoint}`),
      validateResponseWasSuccessful: (response) => {
        expect(response.status).toEqual(302);
        expect(response.headers.location).toEqual('/dashboard');
      },
      numberOfSignInOtpAttemptsRemaining: attemptsLeft,
    });

    describe('with a valid partial auth token', () => {
      const partialAuthToken = 'partial auth token';
      const email = 'email@example.com';
      const password = 'a password';
      const numberOfSendSignInOtpAttemptsRemaining = attemptsLeft;
      let sessionCookie;
      beforeEach(async () => {
        resetAllWhenMocks();
        jest.clearAllMocks();
        api.login.mockImplementation(mockLogin(partialAuthToken));
        sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);
        when(api.validatePartialAuthToken).calledWith(partialAuthToken).mockResolvedValueOnce();
      });

      describe('when the user does not have a session', () => {
        beforeEach(() => {
          mockSuccessfulSendSignInOtpResponse();
        });

        it('redirects the user to /login', async () => {
          const { status, headers } = await post().to(`/login/${endpoint}`);

          expect(status).toEqual(HttpStatusCode.Found);
          expect(headers.location).toEqual('/login');
        });
      });

      describe.each([
        {
          description: 'when a user is not blocked',
          beforeEachSetUp: () => {
            mockSuccessfulSendSignInOtpResponse();
          },
        },
        {
          description: 'when a user is blocked',
          beforeEachSetUp: () => {
            mock403SendSignInOtpResponse();
          },
        },
        {
          description: 'when sending an email fails',
          beforeEachSetUp: () => {
            mock500SendSignInOtpResponse();
          },
        },
      ])('$description', ({ beforeEachSetUp }) => {
        beforeEach(() => {
          beforeEachSetUp();
        });

        itRedirectsTheUserToDashboard();
      });

      function itRedirectsTheUserToDashboard() {
        it('redirects the user to /dashboard', async () => {
          const { status, headers } = await post({ sixDigitAccessCode: '123456' }, { Cookie: sessionCookie }).to(`/login/${endpoint}`);

          expect(status).toEqual(HttpStatusCode.Found);
          expect(headers.location).toEqual('/dashboard');
        });
      }

      function mockSuccessfulSendSignInOtpResponse() {
        when(api.sendSignInOTP).calledWith(expect.anything()).mockResolvedValue({ data: { numberOfSendSignInOtpAttemptsRemaining } });
      }

      function mockUnsuccessfulSendSignInOtpResponseWithStatusCode(statusCode) {
        const error = new Error(`Request failed with status: ${statusCode}`);
        error.response = { status: statusCode };
        when(api.sendSignInOTP).calledWith(expect.anything()).mockRejectedValue(error);
      }

      function mock403SendSignInOtpResponse() {
        mockUnsuccessfulSendSignInOtpResponseWithStatusCode(403);
      }

      function mock500SendSignInOtpResponse() {
        mockUnsuccessfulSendSignInOtpResponseWithStatusCode(500);
      }
    });
  });
};

module.exports = {
  withSendNewOtpApiTests,
};
