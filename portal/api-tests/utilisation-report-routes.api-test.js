jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../server/routes/middleware/csrf', () => ({
  ...jest.requireActual('../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../server/api', () => ({
  login: jest.fn(),
  validateToken: () => true,
}));

const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get } = require('./create-api').createApi(app);
const { ROLES } = require('../server/constants');
const MOCK_BANKS = require('../test-helpers/mock-banks');

describe('utilisation-report routes', () => {
  describe('GET banks/:bankId/utilisation-report-download/:_id', () => {
    const getUrl = ({ bankId, reportId }) => `banks/${bankId}/utilisation-report-download/${reportId}`;

    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) =>
        get(
          getUrl({
            bankId: MOCK_BANKS.BARCLAYS.id,
            reportId: '5099803df3f4948bd2f98391',
          }),
          {},
          headers,
        ),
      whitelistedRoles: [ROLES.PAYMENT_REPORT_OFFICER],
      successCode: 200,
    });
  });
});
