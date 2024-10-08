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

const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');
const app = require('../../server/createApp');
const { get, post } = require('../create-api').createApi(app);

const { MAKER } = ROLES;

const allRoles = Object.values(ROLES);

const _id = '64ef48ee17a3231be0ad48b3';
const prefix = 'prefix';

describe('about routes', () => {
  describe('GET /contract/:_id/about/supplier', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/about/supplier`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/supplier', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/supplier`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/about/buyer` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/supplier/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/supplier/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/supplier/companies-house-search/:prefix', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/supplier/companies-house-search/${prefix}`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/about/supplier#${prefix}-companies-house-registration-number` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/about/buyer', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/about/buyer`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/buyer', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/buyer`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/about/financial` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/buyer/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/buyer/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/about/financial', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/about/financial`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/financial', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/financial`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/about/check-your-answers` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/financial/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/financial/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/about/check-your-answers', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/about/check-your-answers`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});
