const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { get, post } = require('./create-api').createApi(app);
const { NON_ADMIN_ROLES } = require('../server/constants');

const pwdResetToken = 'pwd-reset-token';

describe('login routes', () => {
  describe('GET /login', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/login', {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 200,
    });
  });

  describe('POST /login', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/login'),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 200,
    });
  });

  describe('GET /logout', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/logout', {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 302,
      successHeaders: { location: '/login' },
    });
  });

  describe('GET /reset-password', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/reset-password', {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 200,
    });
  });

  describe('POST /reset-password', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/reset-password'),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 200,
    });
  });

  describe('GET /reset-password:pwdResetToken', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/reset-password/${pwdResetToken}`, {}, headers),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 200,
    });
  });

  describe('POST /reset-password:pwdResetToken', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/reset-password/${pwdResetToken}`),
      allowedNonAdminRoles: NON_ADMIN_ROLES,
      successCode: 302,
      successHeaders: { location: '/login?passwordupdated=1' },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});
