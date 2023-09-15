const { CHECKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);

const dealId = '123';

describe('submit to ukef routes', () => {
  describe('GET /application-details/:dealId/submit-to-ukef', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/submit-to-ukef`, {}, headers),
      whitelistedRoles: [CHECKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
    });
  });

  describe('POST /application-details/:dealId/submit-to-ukef', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/submit-to-ukef`),
      whitelistedRoles: [CHECKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
    });
  });
});
