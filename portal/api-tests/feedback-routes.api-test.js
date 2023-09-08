const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);
const { ROLES } = require('../server/constants');

const allRoles = Object.values(ROLES);

describe('feedback routes', () => {
  describe('GET /feedback', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/feedback', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });

  describe('POST /feedback', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/feedback'),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });

  describe('GET /thank-you-feedback', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/thank-you-feedback', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });
});
