const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);

const dealId = '123';

describe('application details routes', () => {
  describe('GET /application-details/:dealId', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}`, {}, headers),
      whitelistedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6697: remove and test happy path.
    });
  });

  describe('POST /application-details/:dealId', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}`),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6697: remove and test happy path.
    });
  });
});
