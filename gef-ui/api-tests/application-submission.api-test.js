const { createApi } = require('@ukef/dtfs2-common/api-test');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');

const dealId = '123';

const { get, post } = createApi(app);

describe('application submission routes', () => {
  describe('GET /application-details/:dealId/submit', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/submit`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6697: remove and test happy path.
    });
  });

  describe('POST /application-details/:dealId/submit', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/submit`),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6697: remove and test happy path.
    });
  });
});
