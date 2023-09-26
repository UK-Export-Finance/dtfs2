const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get } = require('./create-api').createApi(app);
const { ROLES } = require('../server/constants');

const allRoles = Object.values(ROLES);

describe('service options routes', () => {
  describe('GET /', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: '/service-options' },
    });
  });

  describe('GET /service-options', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/service-options', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });
});
