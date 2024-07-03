const { MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const { generateParsedMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const databaseHelper = require('./database-helper');

const app = require('../src/createApp');
const testUserCache = require('./api-test-users');
const { MAKER, ADMIN } = require('../src/v1/roles/roles');

const { as } = require('./api')(app);
const { expectMongoId } = require('./expectMongoIds');

const CONSTANTS = require('../src/constants');
const { FACILITY_TYPE } = require('../src/v1/gef/enums');

const mockEligibilityCriteria = require('./fixtures/gef/eligibilityCriteria');

const expectedEligibilityCriteriaAuditRecord = {
  ...generateParsedMockPortalUserAuditDatabaseRecord('abcdef123456abcdef123456'),
  lastUpdatedByPortalUserId: expect.any(String),
};

const gefApplicationsUrl = '/v1/gef/application';
const gefFacilitiesUrl = '/v1/gef/facilities';

// NOTE: to maintain backwards compatibility we shouldn't change this from version 2.1
const mockEligibilityCriteriaVersion = mockEligibilityCriteria.find((criteria) => criteria.version === 2.1);

const originalEnv = { ...process.env };

const getVersion0ApplicationToSubmit = () => ({
  dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
  maker: {},
  bank: {},
  bankInternalRefName: 'Bank 1',
  additionalRefName: 'Team 1',
  exporter: {},
  createdAt: '2021-01-01T00:00',
  mandatoryVersionId: 33,
  status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
  updatedAt: null,
  submissionCount: 0,
  editedBy: [null],
  facilitiesUpdated: null,
});

/**
 * NOTE: A migration needs to be run on production if this test is changed.
 * We should maintain backwards compatibility with version 0 deals
 *
 * @returns a version 0 GEF application.
 */
const getVersion0Application = (makerId) => ({
  ...getVersion0ApplicationToSubmit(),
  version: 0,
  status: CONSTANTS.DEAL.DEAL_STATUS.DRAFT,
  editedBy: expect.any(Array),
  createdAt: expect.any(Number),
  updatedAt: expect.any(Number),
  dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
  submissionType: null,
  submissionCount: 0,
  submissionDate: null,
  supportingInformation: {},
  ukefDealId: null,
  checkerId: null,
  portalActivities: [],
  eligibility: {
    version: expect.any(Number),
    _id: expect.any(String),
    product: expect.any(String),
    createdAt: expect.any(Number),
    isInDraft: false,
    criteria: mockEligibilityCriteriaVersion.criteria.map((criterion) => ({
      ...criterion,
      answer: null,
    })),
    auditRecord: expectedEligibilityCriteriaAuditRecord,
  },
  maker: expect.any(Object),
  exporter: {
    status: expect.any(String),
    updatedAt: expect.any(Number),
  },
  auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(makerId),
});

/**
 * NOTE: A migration needs to be run on production if this test is changed.
 * We should maintain backwards compatibility with version 0 facilities
 *
 * @returns a version 0 GEF facility.
 */
const getVersion0Facility = (dealId, makerId) => ({
  status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
  details: {
    _id: expect.any(String),
    dealId,
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
    auditRecord: generateParsedMockPortalUserAuditDatabaseRecord(makerId),
  },
  validation: {
    required: ['monthsOfCover', 'details', 'currency', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
  },
});

describe('GEF deal versioning', () => {
  let aMaker;
  let anAdmin;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
    anAdmin = testUsers().withRole(ADMIN).one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([MONGO_DB_COLLECTIONS.DEALS, MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA]);
    await as(anAdmin).post(mockEligibilityCriteriaVersion).to('/v1/gef/eligibility-criteria');
  });

  describe(`when GEF_DEAL_VERSION set to '0'`, () => {
    beforeAll(() => {
      process.env.GEF_DEAL_VERSION = '0';
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('returns the expected version 0 application upon creation', async () => {
      const { body } = await as(aMaker).post(getVersion0ApplicationToSubmit()).to(gefApplicationsUrl);

      expect(body).toEqual(expectMongoId(getVersion0Application(aMaker._id)));
    });

    it('returns the expected version 0 facility on creation', async () => {
      const { body: dealBody } = await as(aMaker).post(getVersion0ApplicationToSubmit()).to(gefApplicationsUrl);
      const { body } = await as(aMaker).post({ dealId: dealBody._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(gefFacilitiesUrl);

      expect(body).toEqual(getVersion0Facility(dealBody._id, aMaker._id));
    });

    it('returns 400 when adding a facility end date to a version 0 facility', async () => {
      const { body: dealBody } = await as(aMaker).post(getVersion0ApplicationToSubmit()).to(gefApplicationsUrl);
      const { body: facilityBody } = await as(aMaker).post({ dealId: dealBody._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(gefFacilitiesUrl);
      const { status, body } = await as(aMaker).put({ facilityEndDateExists: true }).to(`${gefFacilitiesUrl}/${facilityBody.details._id}`);

      expect(status).toBe(400);
      expect(body).toEqual({ status: 400, message: 'Cannot add facility end date to deal version 0' });
    });

    it('returns 400 when creating a version 0 facility with facility end date', async () => {
      const { body: dealBody } = await as(aMaker).post(getVersion0ApplicationToSubmit()).to(gefApplicationsUrl);
      const { body: facilityBody } = await as(aMaker)
        .post({ dealId: dealBody._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, facilityEndDateExists: true })
        .to(gefFacilitiesUrl);
      const { status, body } = await as(aMaker).put({ facilityEndDateExists: true }).to(`${gefFacilitiesUrl}/${facilityBody.details._id}`);

      expect(status).toBe(400);
      expect(body).toEqual({ status: 400, message: 'Cannot add facility end date to deal version 0' });
    });
  });
});
