jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));
jest.mock('../../server/api', () => ({
  login: jest.fn(),
  sendSignInLink: jest.fn(),
  loginWithSignInLink: jest.fn(),
  validateToken: () => true,
  createBond: jest.fn().mockResolvedValue({ dealId: '64ef48ee17a3231be0ad48b3', bondId: 'bondId' }),
  contractBond: jest.fn().mockResolvedValue({
    dealId: '64ef48ee17a3231be0ad48b3',
    bond: {
      status: 'Not started',
      facilityStage: 'Unissued',
      issueFacilityDetailsSubmitted: false,
      currency: { id: 'GBP', text: 'GBP' },
      requestedCoverStartDate: '2024-01-01T00:00:00.000Z',
      'requestedCoverStartDate-day': '1',
      'requestedCoverStartDate-month': '1',
      'requestedCoverStartDate-year': '2024',
    },
    validationErrors: { count: 0, errorList: {} },
  }),
  updateBond: jest.fn().mockResolvedValue({}),
  updateBondIssueFacility: jest.fn().mockResolvedValue({}),
  updateBondCoverStartDate: jest.fn().mockResolvedValue({ bond: { status: 'Not started' }, validationErrors: { count: 0, errorList: {} } }),
  deleteBond: jest.fn().mockResolvedValue({}),
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
const bondId = 'bondId';

describe('bond routes', () => {
  describe('GET /contract/:_id/bond/create', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/create`, {}, headers),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/bond/${bondId}/details` },
    });
  });

  describe('GET /contract/:_id/bond/:bondId/details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/details`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/bond/:bondId/details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/details`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/bond/${bondId}/financial-details` },
    });
  });

  describe('POST /contract/:_id/bond/:bondId/details/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/details/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('GET /contract/:_id/bond/:bondId/financial-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/financial-details`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/bond/:bondId/financial-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/financial-details`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/bond/${bondId}/fee-details` },
    });
  });

  describe('POST /contract/:_id/bond/:bondId/financial-details/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/financial-details/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('GET /contract/:_id/bond/:bondId/fee-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/fee-details`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/bond/:bondId/fee-details', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/fee-details`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}/bond/${bondId}/check-your-answers` },
    });
  });

  describe('POST /contract/:_id/bond/:bondId/fee-details/save-go-back', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/fee-details/save-go-back`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('GET /contract/:_id/bond/:bondId/check-your-answers', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/check-your-answers`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('GET /contract/:_id/bond/:bondId/issue-facility', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/issue-facility`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/bond/:bondId/issue-facility', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/issue-facility`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('GET /contract/:_id/bond/:bondId/confirm-requested-cover-start-date', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/confirm-requested-cover-start-date`, {}, headers),
      whitelistedRoles: allRoles,
      successCode: 200,
    });
  });

  describe('POST /contract/:_id/bond/:bondId/confirm-requested-cover-start-date', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/confirm-requested-cover-start-date`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });

  describe('GET /contract/:_id/bond/:bondId/delete', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/contract/${_id}/bond/${bondId}/delete`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: 200,
      redirectUrlForInvalidRoles: `/contract/${_id}`,
    });
  });

  describe('POST /contract/:_id/bond/:bondId/delete', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/contract/${_id}/bond/${bondId}/delete`),
      whitelistedRoles: allRoles,
      successCode: 302,
      successHeaders: { location: `/contract/${_id}` },
    });
  });
});
