const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);

describe('scheme type routes', () => {
  describe('GET /select-scheme', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/select-scheme', {}, headers),
      whitelistedRoles: ['maker'],
      successCode: 200,
    });
  });

  describe('POST /select-scheme', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/select-scheme'),
      whitelistedRoles: ['maker'],
      successCode: 200,
    });
  });
});
