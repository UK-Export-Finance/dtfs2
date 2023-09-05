const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get } = require('./create-api').createApi(app);
const { ROLES } = require('../server/constants');

describe('footer routes', () => {
  describe('GET /contact-us', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/contact-us', {}, headers),
      whitelistedRoles: ROLES,
      successCode: 200,
    });
  });

  describe('GET /cookies', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/cookies', {}, headers),
      whitelistedRoles: ROLES,
      successCode: 200,
    });
  });

  describe('GET /accessibility-statement', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/accessibility-statement', {}, headers),
      whitelistedRoles: ROLES,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});
