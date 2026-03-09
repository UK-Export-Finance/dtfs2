// TODO DTFS2-8222: Enable these skipped tests when the 2FA login flow is enabled in portal-ui/server/routes/login/index.js.
// Tested locally by temporarily enabling the route and running the tests -- all passed.

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));

jest.mock('../../server/api', () => ({
  login: jest.fn(),
  loginWithSignInOtp: jest.fn(),
  validateToken: jest.fn(() => false),
  validatePartialAuthToken: jest.fn(),
  sendSignInOTP: jest.fn(),
}));

const { when, resetAllWhenMocks } = require('jest-when');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const { HttpStatusCode } = require('axios');
const api = require('../../server/api');
const app = require('../../server/createApp');
const extractSessionCookie = require('../helpers/extractSessionCookie');
const { withPartial2faAuthValidationApiTests } = require('../common-tests/partial-2fa-auth-validation-api-tests');

const { post } = createApi(app);

const partialAuthToken = 'partial auth token';
const email = 'email@example.com';
const password = 'a password';

describe('POST /login/check-your-email-access-code', () => {
  withPartial2faAuthValidationApiTests({
    makeRequestWithHeaders: (headers) => post({ sixDigitAccessCode: '123456' }, headers).to('/login/check-your-email-access-code'),
    validateResponseWasSuccessful: (response) => {
      expect(response.status).toEqual(HttpStatusCode.Found);
    },
  });

  describe('when the user has a valid partial auth token and an expired access code', () => {
    let sessionCookie;

    beforeEach(async () => {
      // Arrange
      resetAllWhenMocks();
      jest.clearAllMocks();
      // Use a custom login mock that includes userId, which is required by the controller
      api.login.mockResolvedValue({
        token: partialAuthToken,
        user: { email, userId: 'mock-user-id' },
        loginStatus: 'Valid username and password',
      });
      api.sendSignInOTP.mockResolvedValue({ data: { numberOfSignInOtpAttemptsRemaining: 2 } });
      api.loginWithSignInOtp.mockResolvedValue({ isExpired: true });
      when(api.validatePartialAuthToken).calledWith(partialAuthToken).mockResolvedValue(undefined);

      sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);
    });

    it('should redirect to /login/access-code-expired', async () => {
      const requestBody = { sixDigitAccessCode: '000000' };

      // Act
      const response = await post(requestBody, { Cookie: sessionCookie }).to('/login/check-your-email-access-code');

      // Assert
      expect(response.status).toEqual(HttpStatusCode.Found);
      expect(response.headers.location).toEqual('/login/access-code-expired');
    });
  });
});
