const { MONGO_DB_COLLECTIONS, FACILITY_TYPE } = require('@ukef/dtfs2-common');
const { generateParsedMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const databaseHelper = require('./database-helper');
const app = require('../src/createApp');
const testUserCache = require('./api-test-users');
const { MAKER, ADMIN } = require('../src/v1/roles/roles');
const { as } = require('./api')(app);
const { expectMongoId } = require('./expectMongoIds');
const CONSTANTS = require('../src/constants');
const mockEligibilityCriteria = require('./fixtures/gef/eligibilityCriteria');
const mockMandatoryCriteria = require('./fixtures/gef/mandatoryCriteriaVersioned');

const expectedEligibilityCriteriaAuditRecord = {
  ...generateParsedMockPortalUserAuditDatabaseRecord('abcdef123456abcdef123456'),
  lastUpdatedByPortalUserId: expect.any(String),
};

const gefApplicationsUrl = '/v1/gef/application';
const gefFacilitiesUrl = '/v1/gef/facilities';

// NOTE: to maintain backwards compatibility we shouldn't change this from version 2.1
const mockEligibilityCriteriaVersion = mockEligibilityCriteria.find((criteria) => criteria.version === 2.1);
const mockMandatoryCriteriaVersion = mockMandatoryCriteria.find((criteria) => criteria.version === 2);

const originalEnv = { ...process.env };

const generateVersion0ApplicationToSubmit = () => ({
  dealType: CONSTANTS.DEAL.DEAL_TYPE.GEF,
  maker: {},
  bank: {},
  bankInternalRefName: 'Bank 1',
  additionalRefName: 'Team 1',
  exporter: {},
  createdAt: '2021-01-01T00:00',
  mandatoryVersionId: 2,
  status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
  updatedAt: null,
  submissionCount: 0,
  editedBy: [null],
  facilitiesUpdated: null,
});

/**
 * NOTE: If you change this fixture, then a migration needs to be run on production.
 * This function creates a version 0 GEF deal, which is used in tests to maintain backwards compatability with in-flight deals.
 * Therefore, if you find yourself needing to change this, then existing version 0 GEF deals will also need updating.
 */
const generateVersion0ApplicationResponse = (makerId) => ({
  ...generateVersion0ApplicationToSubmit(),
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
    version: 2.1,
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
 * NOTE: If you change this fixture, then a migration needs to be run on production.
 * This function creates a facility for a version 0 GEF deal, which is used in tests to maintain backwards compatability with in-flight deals.
 * Therefore, if you find yourself needing to change this, then existing version 0 GEF facilities will also need updating.
 */
const generateVersion0Facility = (dealId, makerId) => ({
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
    await databaseHelper.wipe([
      MONGO_DB_COLLECTIONS.DEALS,
      MONGO_DB_COLLECTIONS.FACILITIES,
      MONGO_DB_COLLECTIONS.GEF_ELIGIBILITY_CRITERIA,
      MONGO_DB_COLLECTIONS.GEF_MANDATORY_CRITERIA_VERSIONED,
    ]);
    await as(anAdmin).post(mockEligibilityCriteriaVersion).to('/v1/gef/eligibility-criteria');
    await as(anAdmin).post(mockMandatoryCriteriaVersion).to('/v1/gef/mandatory-criteria-versioned');
  });

  describe(`when GEF_DEAL_VERSION set to '0'`, () => {
    beforeAll(() => {
      process.env.GEF_DEAL_VERSION = '0';
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    describe(`POST ${gefApplicationsUrl}`, () => {
      it('returns the expected version 0 application upon creation', async () => {
        const { body } = await as(aMaker).post(generateVersion0ApplicationToSubmit()).to(gefApplicationsUrl);

        expect(body).toEqual(expectMongoId(generateVersion0ApplicationResponse(aMaker._id)));
      });
    });

    describe(`POST ${gefFacilitiesUrl}`, () => {
      it('returns the expected version 0 facility', async () => {
        const { body: dealBody } = await as(aMaker).post(generateVersion0ApplicationToSubmit()).to(gefApplicationsUrl);
        const { body } = await as(aMaker).post({ dealId: dealBody._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(gefFacilitiesUrl);

        expect(body).toEqual(generateVersion0Facility(dealBody._id, aMaker._id));
      });
    });
  });
});
