const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const { ADMIN, UKEF_OPERATIONS } = require('../server/constants/roles');
const { get, post } = require('./create-api').createApi(app);

const _id = '64f736071f0fd6ecf617db8a';

describe('user routes', () => {
  describe('GET /admin/users', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/admin/users', {}, headers),
      whitelistedRoles: [ADMIN, UKEF_OPERATIONS],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /admin/users/create', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get('/admin/users/create', {}, headers),
      whitelistedRoles: [ADMIN, UKEF_OPERATIONS],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /admin/users/create', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to('/admin/users/create'),
      whitelistedRoles: [ADMIN, UKEF_OPERATIONS],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /admin/users/edit/:_id', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/admin/users/edit/${_id}`, {}, headers),
      whitelistedRoles: [ADMIN, UKEF_OPERATIONS],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /admin/users/edit/:_id', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/admin/users/edit/${_id}`),
      whitelistedRoles: [ADMIN, UKEF_OPERATIONS],
      successCode: 302,
      successHeaders: { location: '/admin/users' },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /admin/users/disable/:_id', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/admin/users/disable/${_id}`, {}, headers),
      whitelistedRoles: [ADMIN, UKEF_OPERATIONS],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /admin/users/enable/:_id', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/admin/users/enable/${_id}`, {}, headers),
      whitelistedRoles: [ADMIN, UKEF_OPERATIONS],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /admin/users/:_id/change-password', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/admin/users/${_id}/change-password`, {}, headers),
      whitelistedRoles: [ADMIN, UKEF_OPERATIONS],
      successCode: 200,
    });
  });

  describe('POST /admin/users/:_id/change-password', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/admin/users/${_id}/change-password`),
      whitelistedRoles: [ADMIN, UKEF_OPERATIONS],
      successCode: 302,
      successHeaders: { location: `/admin/users/edit/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});
