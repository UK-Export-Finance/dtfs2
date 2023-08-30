const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);
const { NON_ADMIN_ROLES } = require('../server/constants');

describe('start routes', () => {
  describe('GET /before-you-start', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/before-you-start', {}, headers),
      allowedNonAdminRoles: ['maker'],
      successCode: 200,
    });
  });

  describe('POST /before-you-start', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/before-you-start'),
      allowedNonAdminRoles: ['maker'],
      successCode: 200,
    });
  });

  describe('GET /before-you-start/bank-deal', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/before-you-start/bank-deal', {}, headers),
      allowedNonAdminRoles: ['maker'],
      successCode: 200,
    });
  });

  describe('POST /before-you-start/bank-deal', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/before-you-start/bank-deal'),
      allowedNonAdminRoles: ['maker'],
      successCode: 302,
      successHeaders: { location: '/contract/undefined' },
    });
  });

  describe('GET /unable-to-proceed', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/unable-to-proceed', {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 200,
    });
  });
});
