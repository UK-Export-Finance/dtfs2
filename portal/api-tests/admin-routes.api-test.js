const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);

const _id = '64f736071f0fd6ecf617db8a';

describe('user routes', () => {
  describe('GET /admin/:_id', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/admin/${_id}`, {}, headers),
      whitelistedRoles: ['admin', 'ukef_operations'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /admin/:_id/change-password', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/admin/${_id}/change-password`, {}, headers),
      whitelistedRoles: ['admin', 'ukef_operations'],
      successCode: 200,
    });
  });

  describe('POST /admin/:_id/change-password', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/admin/${_id}/change-password`),
      whitelistedRoles: ['admin', 'ukef_operations'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});
