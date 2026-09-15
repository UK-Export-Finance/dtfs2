const { createApi } = require('@ukef/dtfs2-common/api-test');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');

const { get, post } = createApi(app);

describe('mandatory criteria routes', () => {
  describe('GET /mandatory-criteria', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/mandatory-criteria', {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /mandatory-criteria', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/mandatory-criteria'),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });
});
