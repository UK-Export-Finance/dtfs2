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
const bondId = 'bondId';

describe('bond routes', () => {
  describe('GET /contract/:_id/bond/create', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/create`, {}, headers),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/bond/${bondId}/details` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/bond/:bondId/details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/details`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/bond/:bondId/details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/details`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/bond/${bondId}/financial-details` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/bond/:bondId/details/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/details/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/bond/:bondId/financial-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/financial-details`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/bond/:bondId/financial-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/financial-details`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/bond/${bondId}/fee-details` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/bond/:bondId/financial-details/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/financial-details/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/bond/:bondId/fee-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/fee-details`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/bond/:bondId/fee-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/fee-details`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/bond/${bondId}/check-your-answers` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/bond/:bondId/fee-details/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/fee-details/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/bond/:bondId/check-your-answers', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/check-your-answers`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/bond/:bondId/issue-facility', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/issue-facility`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true,
    });
  });

  describe('POST /contract/:_id/bond/:bondId/issue-facility', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/issue-facility`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/bond/:bondId/confirm-requested-cover-start-date', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/confirm-requested-cover-start-date`, {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/bond/:bondId/confirm-requested-cover-start-date', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/confirm-requested-cover-start-date`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/bond/:bondId/delete', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/delete`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      disableHappyPath: true,
      redirectUrlForInvalidRoles: `/contract/${_id}`,
    });
  });

  describe('POST /contract/:_id/bond/:bondId/delete', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/delete`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});
