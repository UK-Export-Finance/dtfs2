const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get } = require('./create-api').createApi(app);
const { ROLES } = require('../server/constants');

const allRoles = Object.values(ROLES);

describe('footer routes', () => {
  describe('GET /contact-us', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/contact-us', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });

  describe('GET /cookies', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/cookies', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });

  describe('GET /accessibility-statement', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/accessibility-statement', {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });
});
