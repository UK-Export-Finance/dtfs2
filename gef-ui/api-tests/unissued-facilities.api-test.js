jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  verify: jest.fn((req, res, next) => next()),
}));

const { createApi } = require('@ukef/dtfs2-common/api-test');
const { HttpStatusCode } = require('axios');
const { MAKER } = require('../server/constants/roles');
const { withRoleValidationApiTests } = require('./common-tests/role-validation-api-tests');
const app = require('../server/createApp');
const api = require('../server/services/api');
const { MOCK_BASIC_DEAL } = require('../server/utils/mocks/mock-applications');

const cloneMock = (value) => JSON.parse(JSON.stringify(value));

const { get, post } = createApi(app);

const dealId = '123';
const facilityId = '111';

const mockFacility = {
  details: {
    _id: facilityId,
    dealId,
    type: 'Cash',
    name: 'Facility one',
    hasBeenIssued: false,
    shouldCoverStartOnSubmission: null,
    issueDate: null,
    coverStartDate: null,
    coverEndDate: '2030-01-01T00:00:00.000Z',
    monthsOfCover: null,
    isUsingFacilityEndDate: null,
  },
};

describe('unissued facilities routes', () => {
  beforeEach(() => {
    api.getApplication.mockResolvedValue(cloneMock(MOCK_BASIC_DEAL));
    api.getFacilities.mockResolvedValue({ status: 'Completed', items: [] });
    api.getUserDetails.mockResolvedValue({ _id: '619bae3467cc7c002069fc21', firstname: 'Checker', surname: 'One' });
    api.getPortalAmendmentsOnDeal.mockResolvedValue([]);
    api.getFacility.mockResolvedValue(cloneMock(mockFacility));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /application-details/:dealId/unissued-facilities', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/unissued-facilities`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });

  describe('GET /application-details/:dealId/unissued-facilities/:facilityId/about', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/unissued-facilities/${facilityId}/about`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });

  describe('POST /application-details/:dealId/unissued-facilities/:facilityId/about', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/unissued-facilities/${facilityId}/about`),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });

  describe('GET /application-details/:dealId/unissued-facilities/:facilityId/change', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/unissued-facilities/${facilityId}/change`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });

  describe('POST /application-details/:dealId/unissued-facilities/:facilityId/change', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/unissued-facilities/${facilityId}/change`),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });

  describe('GET /application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => get(`/application-details/${dealId}/unissued-facilities/${facilityId}/change-to-unissued`, {}, headers),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });

  describe('POST /application-details/:dealId/unissued-facilities/:facilityId/change-to-unissued', () => {
    withRoleValidationApiTests({
      makeRequestWithHeaders: (headers) => post({}, headers).to(`/application-details/${dealId}/unissued-facilities/${facilityId}/change-to-unissued`),
      whitelistedRoles: [MAKER],
      successCode: HttpStatusCode.Ok,
    });
  });
});
