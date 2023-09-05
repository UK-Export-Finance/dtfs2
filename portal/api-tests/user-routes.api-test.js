const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);
const { ROLES } = require('../server/constants');

const _id = '64f736071f0fd6ecf617db8a';

describe('user routes', () => {
  describe('GET /:_id', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/${_id}`, {}, headers),
      whitelistedRoles: ROLES,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /:_id/change-password', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/${_id}/change-password`, {}, headers),
      whitelistedRoles: ROLES,
      successCode: 200,
    });
  });

  describe('POST /:_id/change-password', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/${_id}/change-password`),
      whitelistedRoles: ROLES,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});
