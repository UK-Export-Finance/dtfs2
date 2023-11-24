jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../server/routes/middleware/csrf', () => ({
  ...jest.requireActual('../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
}));

const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get } = require('./create-api').createApi(app);
const { ROLES } = require('../server/constants');

const allRolesExceptPaymentReportOfficer = Object.values(ROLES).filter((role) => role !== ROLES.PAYMENT_REPORT_OFFICER);

describe('default route', () => {
  describe('GET /', () => {
    describe('when the user is not logged in', () => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get('/', {}, headers),
        whitelistedRoles: [],
        successCode: 302,
        successHeaders: { location: '/login' },
      });
    });

    describe('when the user is not a payment report officer', () => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get('/', {}, headers),
        whitelistedRoles: allRolesExceptPaymentReportOfficer,
        successCode: 302,
        successHeaders: { location: '/dashboard/deals/0' },
      });
    });

    describe('when the user is a payment report officer', () => {
      withRoleValidationApiTests({
        makeRequestWithHeaders: (headers) => get('/', {}, headers),
        whitelistedRoles: [ROLES.PAYMENT_REPORT_OFFICER],
        successCode: 302,
        successHeaders: { location: '/utilisation-report-upload' },
      });
    });
  });
});
