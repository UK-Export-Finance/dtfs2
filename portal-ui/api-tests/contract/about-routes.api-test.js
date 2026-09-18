jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));
jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  getSubmissionDetails: jest.fn().mockResolvedValue({ validationErrors: { count: 0, errorList: {} } }),
  updateSubmissionDetails: jest.fn().mockResolvedValue({}),
}));
jest.mock('../../server/companies-api', () => ({
  getCompanyByRegistrationNumber: jest.fn().mockResolvedValue({
    company: {
      companyName: 'Mock company',
      registeredAddress: {
        addressLine1: '1 Mock Street',
        addressLine2: '',
        locality: 'London',
        postalCode: 'SW1A 1AA',
        country: 'GBR',
      },
      industries: [{ code: 'A', name: 'Agriculture', class: { code: 'A1', name: 'Crop production' } }],
    },
  }),
}));

const { createApi } = require('@ukef/dtfs2-common/api-test');
const { ROLES } = require('@ukef/dtfs2-common');
const mockProvide = require('../helpers/mockProvide');

mockProvide();

const { withRoleValidationApiTests } = require('../common-tests/role-validation-api-tests');
const app = require('../../server/createApp');

const { get, post } = createApi(app);

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
    });
  });

  describe('POST /contract/:_id/about/supplier', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/supplier`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/about/buyer` },
    });
  });

  describe('POST /contract/:_id/about/supplier/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/supplier/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('POST /contract/:_id/about/supplier/companies-house-search/:prefix', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/supplier/companies-house-search/${prefix}`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/about/supplier#${prefix}-companies-house-registration-number` },
    });
  });

  describe('GET /contract/:_id/about/buyer', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/about/buyer`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/about/buyer', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/buyer`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/about/financial` },
    });
  });

  describe('POST /contract/:_id/about/buyer/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/buyer/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('GET /contract/:_id/about/financial', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/about/financial`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/about/financial', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/financial`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/about/check-your-answers` },
    });
  });

  describe('POST /contract/:_id/about/financial/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/about/financial/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('GET /contract/:_id/about/check-your-answers', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/about/check-your-answers`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });
});
