jest.mock('../../server/routes/api-data-provider', () => ({
  ...(jest.requireActual('../../server/routes/api-data-provider')),
  provide: () => (req, res, next) => { req.apiData = {}; return next(); },
}));

const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');
const app = require('../../server/createApp');
const { get, post } = require('../create-api').createApi(app);
const { ROLES } = require('../../server/constants');

const _id = '64ef48ee17a3231be0ad48b3';
const prefix = 'prefix';

describe('about routes', () => {
  describe('GET /contract/:_id/about', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/about`, {}, headers),
      whitelistedRoles: ROLES,
      successCode: 200,
    });
  });

  describe('GET /contract/:_id/about/supplier', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/about/supplier`, {}, headers),
      whitelistedRoles: ['maker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/supplier', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/supplier`),
      whitelistedRoles: ROLES,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/about/buyer` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/supplier/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/supplier/save-go-back`),
      whitelistedRoles: ROLES,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/supplier/companies-house-search/:prefix', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/supplier/companies-house-search/${prefix}`),
      whitelistedRoles: ROLES,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/about/supplier#${prefix}-companies-house-registration-number` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/about/buyer', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/about/buyer`, {}, headers),
      whitelistedRoles: ['maker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/buyer', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/buyer`),
      whitelistedRoles: ROLES,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/about/financial` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/buyer/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/buyer/save-go-back`),
      whitelistedRoles: ROLES,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/about/financial', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/about/financial`, {}, headers),
      whitelistedRoles: ['maker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/financial', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/financial`),
      whitelistedRoles: ROLES,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/about/check-your-answers` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('POST /contract/:_id/about/financial/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/financial/save-go-back`),
      whitelistedRoles: ROLES,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });

  describe('GET /contract/:_id/about/check-your-answers', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/about/check-your-answers`, {}, headers),
      whitelistedRoles: ['maker'],
      successCode: 200,
      disableHappyPath: true, // TODO DTFS2-6654: remove and test happy path.
    });
  });
});
