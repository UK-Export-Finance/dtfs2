const { ROLES, PORTAL_LOGIN_STATUS } = require('@ukef/dtfs2-common');
const { createApi } = require('@ukef/dtfs2-common/api-test');
const { login, loginWithSignInOtp, sendSignInOTP } = require('../../server/api');
const app = require('../../server/createApp');
const extractSessionCookie = require('../helpers/extractSessionCookie');
const mockLogin = require('../helpers/login');

const { post } = createApi(app);

const allRoles = Object.values(ROLES);
const email = 'mock email';
const password = 'mock password';

const mockSuccessfulSendSignInOtp = (attemptsLeft) => ({
  data: {
    numberOfSignInOtpAttemptsRemaining: attemptsLeft,
  },
});

const withRoleValidationOtpApiTests = ({
  makeRequestWithHeaders,
  whitelistedRoles,
  successCode,
  successHeaders,
  endpoint,
  attemptsLeft,
  disableHappyPath, // TODO DTFS2-6654: remove and test happy paths.
  redirectUrlForInvalidRoles,
}) => {
  const nonWhitelistedRoles = allRoles.filter((role) => !whitelistedRoles.includes(role));

  describe('role validation', () => {
    if (!disableHappyPath) {
      // TODO DTFS2-6654: remove and test happy paths.
      if (whitelistedRoles.length) {
        describe('whitelisted roles', () => {
          it.each(whitelistedRoles)(`returns a ${successCode} response if the user only has the '%s' role`, async (allowedRole) => {
            login.mockImplementation(mockLogin());
            sendSignInOTP.mockResolvedValue(mockSuccessfulSendSignInOtp(attemptsLeft));
            loginWithSignInOtp.mockResolvedValue({
              loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
              token: 'mock 2FA validated token',
              user: { roles: [allowedRole] },
            });

            const sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);

            // Set up session with numberOfSignInOtpAttemptsRemaining = 2 by calling the sendNewSignInLink endpoint
            await post({}, { Cookie: [sessionCookie] }).to(`/login/${endpoint}`);

            const response = await makeRequestWithHeaders({ Cookie: sessionCookie });
            expect(response.status).toEqual(successCode);

            if (successHeaders) {
              for (const [key, value] of Object.entries(successHeaders)) {
                expect(response.headers[key]).toEqual(value);
              }
            }
          });
        });
      }
    }

    if (nonWhitelistedRoles.length) {
      describe('non-whitelisted roles', () => {
        it.each(nonWhitelistedRoles)("returns a 302 response if the user only has the '%s' role", async (disallowedRole) => {
          login.mockImplementation(mockLogin());
          sendSignInOTP.mockResolvedValue(mockSuccessfulSendSignInOtp());
          loginWithSignInOtp.mockResolvedValue({
            loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
            token: 'mock 2FA validated token',
            user: { roles: [disallowedRole] },
          });

          const sessionCookie = await post({ email, password }).to('/login').then(extractSessionCookie);

          // Set up session with numberOfSignInOtpAttemptsRemaining = 2 by calling the sendSignInOTP endpoint
          await post({}, { Cookie: [sessionCookie] }).to(`/login/${endpoint}`);

          const response = await makeRequestWithHeaders({ Cookie: [sessionCookie] });

          expect(response.status).toEqual(302);
          const redirectUrl = redirectUrlForInvalidRoles ?? '/';
          expect(response.headers.location).toEqual(redirectUrl);
        });
      });
    }
  });
};

module.exports = {
  withRoleValidationOtpApiTests,
};
