const { TODO_DTFS2_UPDATE_ROLE } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get } = require('./create-api').createApi(app);

const dealId = 'dealId-test-value';

describe('application activities routes', () => {
  describe('GET /application-details/:dealId/activities', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/activities`, {}, headers),
      whitelistedRoles: [TODO_DTFS2_UPDATE_ROLE],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6627: remove and test happy path.
    });
  });
});
