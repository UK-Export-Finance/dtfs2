const { generateParsedMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const databaseHelper = require('../../../database-helper');
const CONSTANTS = require('../../../../src/constants');
const { FACILITY_TYPE, ERROR } = require('../../../../src/v1/gef/enums');

const app = require('../../../../src/createApp');
const testUserCache = require('../../../api-test-users');
const { MAKER } = require('../../../../src/v1/roles/roles');

const { as } = require('../../../api')(app);

const baseUrl = '/v1/gef/facilities';
const mockFacilities = require('../../../fixtures/gef/facilities');

const applicationBaseUrl = '/v1/gef/application';
const mockApplications = require('../../../fixtures/gef/application');

const { DB_COLLECTIONS } = require('../../../fixtures/constants');

describe(baseUrl, () => {
  const originalEnv = process.env;
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

  describe(`POST ${baseUrl}`, () => {
    describe.each(['0', '1'])('with GEF_DEAL_VERSION = %s', (dealVersion) => {
      beforeAll(() => {
        process.env.GEF_DEAL_VERSION = dealVersion;
      });

      beforeEach(() => {
        if (dealVersion === '1') {
          newFacility.details.bankReviewDate = null;
          newFacility.details.facilityEndDate = null;
          newFacility.details.isUsingFacilityEndDate = null;
          newFacility.validation.required.unshift('isUsingFacilityEndDate');
        }
      });

      afterAll(() => {
        process.env = originalEnv;
      });

      it('rejects requests that do not present a valid Authorization token', async () => {
        const { status } = await as().post(mockFacilities[0]).to(baseUrl);
        expect(status).toEqual(401);
      });

      it('accepts requests that present a valid Authorization token with "maker" role', async () => {
        const { status } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        expect(status).toEqual(201);
      });

      it('returns a new facility upon creation', async () => {
        const { body } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        expect(body).toEqual(newFacility);
      });

      it('returns a 400 if the dealId is invalid', async () => {
        const { body, status } = await as(aMaker).post({ dealId: 'test', type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        expect(status).toBe(400);
        expect(body).toEqual({ status: 400, message: 'Invalid deal ID: test' });
      });

      it('returns a 404 if the dealId is valid but does not exist', async () => {
        const { body, status } = await as(aMaker).post({ dealId: 'abcdef123456abcdef123456', type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        expect(status).toBe(404);
        expect(body).toEqual({ status: 404, message: 'Deal not found: abcdef123456abcdef123456' });
      });

      it('returns an mandatory error when an application ID is missing', async () => {
        const { status, body } = await as(aMaker).post({ type: 'TEST' }).to(baseUrl);
        expect(status).toEqual(422);
        expect(body).toEqual([
          {
            status: 422,
            errCode: ERROR.MANDATORY_FIELD,
            errMsg: 'No Application ID and/or facility type sent with request',
          },
        ]);
      });

      it('returns an mandatory error when facility type is missing', async () => {
        const { status, body } = await as(aMaker).post({ dealId: mockApplication.body._id }).to(baseUrl);
        expect(status).toEqual(422);
        expect(body).toEqual([
          {
            status: 422,
            errCode: ERROR.MANDATORY_FIELD,
            errMsg: 'No Application ID and/or facility type sent with request',
          },
        ]);
      });

      it('returns an enum error when putting the wrong type', async () => {
        const { status, body } = await as(aMaker).post({ dealId: mockApplication.body._id, type: 'TEST' }).to(baseUrl);
        expect(status).toEqual(422);
        expect(body).toEqual([
          {
            status: 422,
            errCode: ERROR.ENUM_ERROR,
            errMsg: 'Unrecognised enum',
            errRef: 'type',
          },
        ]);
      });

      it(`overall status shows as "${CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED}" if all status is marked as "${CONSTANTS.DEAL.DEAL_STATUS.NOT_STARTED}"`, async () => {
        await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        const mockQuery = { dealId: mockApplication.body._id };
        const { body, status } = await as(aMaker).get(baseUrl, mockQuery);

        expect(status).toEqual(200);
        expect(body.status).toEqual(CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS);
        expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
      });
    });

    describe(`with GEF_DEAL_VERSION set to 0`, () => {
      beforeAll(() => {
        process.env.GEF_DEAL_VERSION = '0';
      });

      afterAll(() => {
        process.env = originalEnv;
      });

      it('returns 400 when payload contains isUsingFacilityEndDate', async () => {
        const { status, body } = await as(aMaker)
          .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, isUsingFacilityEndDate: true })
          .to(baseUrl);

        expect(body).toEqual({ status: 400, message: 'Cannot add facility end date to deal version 0' });
        expect(status).toBe(400);
      });

      it('returns 400 when payload contains bankReviewDate', async () => {
        const { status, body } = await as(aMaker)
          .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, bankReviewDate: new Date().toISOString() })
          .to(baseUrl);

        expect(body).toEqual({ status: 400, message: 'Cannot add facility end date to deal version 0' });
        expect(status).toBe(400);
      });
    });

    describe(`with GEF_DEAL_VERSION set to 1`, () => {
      beforeAll(() => {
        process.env.GEF_DEAL_VERSION = '1';
      });

      afterAll(() => {
        process.env = originalEnv;
      });

      describe(`POST ${baseUrl}`, () => {
        it('returns 201 when payload is valid & contains isUsingFacilityEndDate', async () => {
          const { status } = await as(aMaker)
            .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, isUsingFacilityEndDate: true })
            .to(baseUrl);

          expect(status).toBe(201);
        });

        it('returns 201 when payload is valid & contains bankReviewDate', async () => {
          const { status } = await as(aMaker)
            .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, bankReviewDate: new Date().toISOString() })
            .to(baseUrl);

          expect(status).toBe(201);
        });

        it('returns 400 when isUsingFacilityEndDate is not a boolean', async () => {
          const { status, body } = await as(aMaker)
            .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, isUsingFacilityEndDate: 'true' })
            .to(baseUrl);

          expect(body).toEqual({ status: 400, message: 'Invalid isUsingFacilityEndDate: "true"' });
          expect(status).toEqual(400);
        });

        it('returns 400 when bankReviewDate is not a string', async () => {
          const { status, body } = await as(aMaker)
            .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, bankReviewDate: 1720521372395 })
            .to(baseUrl);

          expect(body).toEqual({ status: 400, message: 'Invalid bankReviewDate: 1720521372395' });
          expect(status).toEqual(400);
        });

        it('returns 400 when bankReviewDate is not a valid ISO-8601 string', async () => {
          const { status, body } = await as(aMaker)
            .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, bankReviewDate: '2024/07/09T10 - 37/15.200Z' })
            .to(baseUrl);

          expect(body).toEqual({ status: 400, message: 'Invalid bankReviewDate: "2024/07/09T10 - 37/15.200Z"' });
          expect(status).toEqual(400);
        });
      });
    });
  });
});
