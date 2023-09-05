const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);
const { ROLES } = require('../server/constants');

describe('feedback routes', () => {
  describe('GET /feedback', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/feedback', {}, headers),
      whitelistedRoles: ROLES,
      successCode: 200,
    });
  });

  describe('GET /feedback', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/feedback'),
      whitelistedRoles: ROLES,
      successCode: 200,
    });
  });

  describe('GET /thank-you-feedback', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/thank-you-feedback', {}, headers),
      whitelistedRoles: ROLES,
      successCode: 200,
    });
  });
});
