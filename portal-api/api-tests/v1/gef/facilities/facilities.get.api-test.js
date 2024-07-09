const { generateParsedMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const databaseHelper = require('../../../database-helper');
const CONSTANTS = require('../../../../src/constants');
const { FACILITY_TYPE } = require('../../../../src/v1/gef/enums');

const app = require('../../../../src/createApp');
const testUserCache = require('../../../api-test-users');
const { withClientAuthenticationTests } = require('../../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../../src/v1/roles/roles');

const { as, get } = require('../../../api')(app);

const baseUrl = '/v1/gef/facilities';

const applicationBaseUrl = '/v1/gef/application';
const mockApplications = require('../../../fixtures/gef/application');

const { DB_COLLECTIONS } = require('../../../fixtures/constants');

describe(baseUrl, () => {
  let aMaker;
  let mockApplication;
  let newFacility;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES, DB_COLLECTIONS.DEALS]);

    mockApplication = await as(aMaker).post(mockApplications[0]).to(applicationBaseUrl);

    newFacility = {
      status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
      details: {
        _id: expect.any(String),
        dealId: mockApplication.body._id,
        type: expect.any(String),
        hasBeenIssued: false,
        name: null,
        shouldCoverStartOnSubmission: null,
        coverStartDate: null,
        coverEndDate: null,
        monthsOfCover: null,
        details: null,
        detailsOther: null,
        currency: null,
        value: null,
        coverPercentage: null,
        interestPercentage: null,
        paymentType: null,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
        ukefExposure: 0,
        guaranteeFee: 0,
        submittedAsIssuedDate: null,
        ukefFacilityId: null,
        dayCountBasis: null,
        feeType: null,
        feeFrequency: null,
        coverDateConfirmed: null,
        canResubmitIssuedFacilities: null,
        issueDate: null,
        unissuedToIssuedByMaker: expect.any(Object),
        hasBeenIssuedAndAcknowledged: null,
        auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(aMaker._id),
      },
      validation: {
        required: ['monthsOfCover', 'details', 'currency', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
      },
    };
  });

  describe(`GET ${baseUrl}?dealId=`, () => {
    const facilitiesUrl = `${baseUrl}?dealId=620a1aa095a618b12da38c7b`;

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(facilitiesUrl),
      makeRequestWithAuthHeader: (authHeader) => get(facilitiesUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(facilitiesUrl),
      successStatusCode: 200,
    });

    it('returns a 400 error if the dealId is not a valid mongo id', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}?dealId=123`);
      expect(status).toEqual(400);
      expect(body).toStrictEqual({ message: 'Invalid Deal Id', status: 400 });
    });
  });

  describe(`GET ${baseUrl}/:id`, () => {
    let oneFacilityUrl;

    beforeEach(async () => {
      const {
        body: {
          details: { _id: createdFacilityId },
        },
      } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
      oneFacilityUrl = `${baseUrl}/${createdFacilityId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(oneFacilityUrl),
      makeRequestWithAuthHeader: (authHeader) => get(oneFacilityUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(oneFacilityUrl),
      successStatusCode: 200,
    });

    it('returns an individual item', async () => {
      const { body } = await as(aMaker).get(oneFacilityUrl);
      expect(body).toEqual(newFacility);
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });
});
