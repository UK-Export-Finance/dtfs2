jest.mock('csurf', () => () => (req, res, next) => next());
jest.mock('../../server/routes/middleware/csrf', () => ({
  ...jest.requireActual('../../server/routes/middleware/csrf'),
  csrfToken: () => (req, res, next) => next(),
}));
jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
}));

const { ROLES } = require('@ukef/dtfs2-common');
const mockProvide = require('../helpers/mockProvide');

mockProvide();
jest.mock('../../server/routes/middleware/validateBank', () => (req, res, next) => next());

const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');
const app = require('../../server/createApp');
const { get, post } = require('../create-api').createApi(app);

const { MAKER, CHECKER } = ROLES;

const allRoles = Object.values(ROLES);

const _id = '64ef48ee17a3231be0ad48b3';

describe('contract routes', () => {
  describe('GET /contract/:_id', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}`, {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/comments', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/comments`, {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/submission-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/submission-details`, {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/delete', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/delete`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/delete', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/delete`),
      whitelistedRoles: [MAKER],
      successCode: 302,
      successHeaders: { location: '/dashboard' },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/ready-for-review', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/ready-for-review`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/ready-for-review', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/ready-for-review`),
      whitelistedRoles: [MAKER],
      successCode: 302,
      successHeaders: { location: '/dashboard' },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/edit-name', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/edit-name`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/edit-name', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/edit-name`),
      whitelistedRoles: [MAKER],
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/return-to-maker', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/return-to-maker`, {}, headers),
      whitelistedRoles: [CHECKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/return-to-maker', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/return-to-maker`),
      whitelistedRoles: [CHECKER],
      successCode: 302,
      successHeaders: { location: '/dashboard' },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/confirm-submission', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/confirm-submission`, {}, headers),
      whitelistedRoles: [CHECKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/confirm-submission', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/confirm-submission`),
      whitelistedRoles: [CHECKER],
      successCode: 302,
      successHeaders: { location: '/dashboard' },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/clone', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/clone`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/clone', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/clone`),
      whitelistedRoles: [MAKER],
      successCode: 302,
      successHeaders: { location: '/dashboard' },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/clone/before-you-start', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/clone/before-you-start`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/clone/before-you-start', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/clone/before-you-start`),
      whitelistedRoles: [MAKER],
      successCode: 302,
      successHeaders: { location: '/unable-to-proceed' },
    });
  });
});
