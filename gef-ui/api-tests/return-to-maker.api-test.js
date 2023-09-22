const { CHECKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);

const dealId = '123';

describe('return to maker routes', () => {
  describe('GET /application-details/:dealId/return-to-maker', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/return-to-maker`, {}, headers),
      whitelistedRoles: [CHECKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6697: remove and test happy path.
    });
  });

  describe('POST /application-details/:dealId/return-to-maker', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/return-to-maker`),
      whitelistedRoles: [CHECKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6697: remove and test happy path.
    });
  });
});
