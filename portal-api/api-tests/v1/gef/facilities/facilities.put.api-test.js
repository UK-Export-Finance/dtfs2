const { generateParsedMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { CURRENCY } = require('@ukef/dtfs2-common');
const databaseHelper = require('../../../database-helper');
const CONSTANTS = require('../../../../src/constants');
const { FACILITY_TYPE, FACILITY_PAYMENT_TYPE, ERROR } = require('../../../../src/v1/gef/enums');

const app = require('../../../../src/createApp');
const testUserCache = require('../../../api-test-users');
const { MAKER } = require('../../../../src/v1/roles/roles');

const { as } = require('../../../api')(app);

const baseUrl = '/v1/gef/facilities';

const applicationBaseUrl = '/v1/gef/application';
const mockApplications = require('../../../fixtures/gef/application');

const { calculateUkefExposure, calculateGuaranteeFee } = require('../../../../src/v1/gef/calculations/facility-calculations');
const { DB_COLLECTIONS } = require('../../../fixtures/constants');

describe(baseUrl, () => {
  const originalEnv = process.env;
  let aMaker;
  let mockApplication;
  let newFacility;
  let completeUpdate;
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
    completeUpdate = {
      hasBeenIssued: false,
      name: 'TEST',
      shouldCoverStartOnSubmission: null,
      coverStartDate: new Date(),
      coverEndDate: new Date(),
      monthsOfCover: 12,
      details: ['test', 'test'],
      detailsOther: null,
      currency: { id: CURRENCY.GBP },
      value: 10000000,
      coverPercentage: 75,
      interestPercentage: 10,
      paymentType: 'Monthly',
      dayCountBasis: 365,
      feeType: FACILITY_PAYMENT_TYPE.IN_ADVANCE,
      feeFrequency: 'Monthly',
      coverDateConfirmed: true,
      ukefFacilityId: 1234,
      issueDate: null,
      hasBeenIssuedAndAcknowledged: true,
    };
  });

  describe(`PUT ${baseUrl}/:id`, () => {
    describe.each(['0', '1'])('with GEF_DEAL_VERSION = %s', (dealVersion) => {
      beforeAll(() => {
        process.env.GEF_DEAL_VERSION = dealVersion;
      });

      beforeEach(() => {
        if (dealVersion === '1') {
          newFacility.details.bankReviewDate = null;
          newFacility.details.isUsingFacilityEndDate = null;
        }
      });

      afterAll(() => {
        process.env = originalEnv;
      });

      it('rejects requests that do not present a valid Authorization token', async () => {
        const { status } = await as().put({}).to(`${baseUrl}/1`);
        expect(status).toEqual(401);
      });

      it('partially updates a facility', async () => {
        const { details } = newFacility;
        const update = {
          hasBeenIssued: false,
          name: 'Test',
          type: 'Cash',
          currency: { id: CURRENCY.GBP },
        };
        const item = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);

        const expected = {
          status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
          details: {
            ...details,
            hasBeenIssued: false,
            name: 'Test',
            currency: { id: CURRENCY.GBP },
            updatedAt: expect.any(Number),
          },
          validation: {
            required: ['monthsOfCover', 'details', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
          },
        };

        expect(body).toEqual(expected);
        expect(status).toEqual(200);
      });

      it('removes start cover date if shouldCoverStartOnSubmission is true', async () => {
        const firstUpdate = {
          shouldCoverStartOnSubmission: false,
          coverStartDate: new Date(),
          coverEndDate: new Date(),
        };
        const secondUpdate = {
          shouldCoverStartOnSubmission: true,
        };
        const item = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        // first update - insert start date
        const res1 = await as(aMaker).put(firstUpdate).to(`${baseUrl}/${item.body.details._id}`);
        expect(res1.status).toEqual(200);
        expect(res1.body.details.shouldCoverStartOnSubmission).toEqual(false);
        expect(res1.body.details.coverStartDate).toEqual(expect.any(String));
        expect(res1.body.details.coverEndDate).toEqual(expect.any(String));

        // second update - remove start date
        const res2 = await as(aMaker).put(secondUpdate).to(`${baseUrl}/${item.body.details._id}`);
        expect(res2.status).toEqual(200);
        expect(res2.body.details.shouldCoverStartOnSubmission).toEqual(true);
        expect(res2.body.details.coverStartDate).toEqual(null);
        expect(res2.body.details.coverEndDate).toEqual(expect.any(String));
      });

      it('fully update a facility ', async () => {
        const { details } = newFacility;
        const update = {
          hasBeenIssued: true,
          name: 'test',
          shouldCoverStartOnSubmission: true,
          coverStartDate: null,
          coverEndDate: '2015-01-01T00:00:00.000Z',
          monthsOfCover: 12,
          details: ['test'],
          detailsOther: null,
          currency: { id: CURRENCY.GBP },
          value: '10000000',
          coverPercentage: 80,
          interestPercentage: 40,
          paymentType: 'Monthly',
          feeType: FACILITY_PAYMENT_TYPE.IN_ADVANCE,
          feeFrequency: 'Monthly',
          dayCountBasis: 365,
          coverDateConfirmed: true,
          ukefFacilityId: 1234,
        };
        const item = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);
        const expected = {
          status: CONSTANTS.DEAL.DEAL_STATUS.COMPLETED,
          details: {
            ...details,
            ...update,
            updatedAt: expect.any(Number),
            value: expect.any(Number),
            monthsOfCover: null, // this is nullified if `hasBeenIssued` is true
            ukefExposure: calculateUkefExposure(update, {}),
            guaranteeFee: calculateGuaranteeFee(update, {}),
            coverDateConfirmed: true,
            ukefFacilityId: 1234,
          },
          validation: {
            required: [],
          },
        };

        expected.details.currency = update.currency;

        expect(body).toEqual(expected);
        expect(status).toEqual(200);
      });

      it('name is required if hasBeenIssued', async () => {
        const { details } = newFacility;
        const update = {
          hasBeenIssued: true,
          name: null,
          shouldCoverStartOnSubmission: true,
          coverStartDate: null,
          coverEndDate: '2015-01-01T00:00:00.000Z',
          monthsOfCover: 12,
          details: ['test'],
          detailsOther: null,
          currency: { id: CURRENCY.GBP },
          value: '10000000',
          coverPercentage: 80,
          interestPercentage: 40,
          paymentType: 'Monthly',
          feeType: FACILITY_PAYMENT_TYPE.IN_ADVANCE,
          feeFrequency: 'Monthly',
          dayCountBasis: 365,
        };
        const item = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);
        const expected = {
          status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
          details: {
            ...details,
            ...update,
            updatedAt: expect.any(Number),
            value: expect.any(Number),
            monthsOfCover: null, // this is nullified if `hasBeenIssued` is true
            ukefExposure: calculateUkefExposure(update, {}),
            guaranteeFee: calculateGuaranteeFee(update, {}),
          },
          validation: {
            required: ['name'],
          },
        };

        expected.details.currency = { id: CURRENCY.GBP };

        expect(body).toEqual(expected);
        expect(status).toEqual(200);
      });

      it('other description is required if I select the other checkmark', async () => {
        const { details } = newFacility;
        const update = {
          details: ['Other'],
        };
        const item = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);
        const expected = {
          status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
          details: {
            ...details,
            ...update,
            updatedAt: expect.any(Number),
          },
          validation: {
            required: [
              'monthsOfCover',
              'detailsOther',
              'currency',
              'value',
              'coverPercentage',
              'interestPercentage',
              'feeType',
              'feeFrequency',
              'dayCountBasis',
            ],
          },
        };

        expect(body).toEqual(expected);
        expect(status).toEqual(200);
      });

      it('completely updates a facility', async () => {
        const { details } = newFacility;
        const item = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item.body.details._id}`);
        const expected = {
          status: CONSTANTS.DEAL.DEAL_STATUS.COMPLETED,
          details: {
            ...details,
            ...completeUpdate,
            coverStartDate: null,
            coverEndDate: null,
            updatedAt: expect.any(Number),
            ukefExposure: calculateUkefExposure(completeUpdate, {}),
            guaranteeFee: calculateGuaranteeFee(completeUpdate, {}),
          },
          validation: {
            required: [],
          },
        };

        expected.details.currency = { id: CURRENCY.GBP };

        expect(body).toEqual(expected);
        expect(status).toEqual(200);
      });

      it("updates the associated deal's facilitiesUpdated timestamp", async () => {
        // create deal
        const { body: createdDeal } = await as(aMaker).post(mockApplications[0]).to(applicationBaseUrl);

        const facility = await as(aMaker).post({ dealId: createdDeal._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        const update = { hasBeenIssued: true };
        await as(aMaker).put(update).to(`${baseUrl}/${facility.body.details._id}`);

        // check the deal
        const { body } = await as(aMaker).get(`${applicationBaseUrl}/${createdDeal._id}`);

        expect(body.facilitiesUpdated).toEqual(expect.any(Number));
      });

      it('returns a 204 - "No Content" if there are no records', async () => {
        const { status } = await as(aMaker).put({}).to(`${baseUrl}/doesnotexist`);
        expect(status).toEqual(204);
      });

      it('should update the coverStartDate and coverEndDate in the right format set to midnight', async () => {
        const { details } = newFacility;
        const update = {
          hasBeenIssued: true,
          name: 'Test',
          currency: { id: CURRENCY.GBP },
          coverStartDate: 'July 19, 2022',
          coverEndDate: 'July 19, 2050',
        };
        const item = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);

        const expected = {
          status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
          details: {
            ...details,
            hasBeenIssued: true,
            name: 'Test',
            currency: { id: CURRENCY.GBP },
            updatedAt: expect.any(Number),
            coverStartDate: '2022-07-19T00:00:00.000Z',
            coverEndDate: '2050-07-19T00:00:00.000Z',
          },
          validation: {
            required: ['details', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
          },
        };

        expect(body).toEqual(expected);
        expect(status).toEqual(200);
      });

      it('should update the coverStartDate and coverEndDate in the right format set to midnight if leap year', async () => {
        const { details } = newFacility;
        const update = {
          hasBeenIssued: true,
          name: 'Test',
          currency: { id: CURRENCY.GBP },
          coverStartDate: 'February 29, 2024',
          coverEndDate: 'February 29, 2040',
        };
        const item = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);

        const expected = {
          status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
          details: {
            ...details,
            hasBeenIssued: true,
            name: 'Test',
            currency: { id: CURRENCY.GBP },
            updatedAt: expect.any(Number),
            coverStartDate: '2024-02-29T00:00:00.000Z',
            coverEndDate: '2040-02-29T00:00:00.000Z',
          },
          validation: {
            required: ['details', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
          },
        };

        expect(body).toEqual(expected);
        expect(status).toEqual(200);
      });

      it('should update the coverStartDate and coverEndDate in the right format set to midnight if years are 9999 and 10000 (upper edge cases)', async () => {
        const { details } = newFacility;
        const update = {
          hasBeenIssued: true,
          name: 'Test',
          currency: { id: CURRENCY.GBP },
          coverStartDate: 'February 01, 9999',
          coverEndDate: 'February 01, 10000',
        };
        const item = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);

        const expected = {
          status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
          details: {
            ...details,
            hasBeenIssued: true,
            name: 'Test',
            currency: { id: CURRENCY.GBP },
            updatedAt: expect.any(Number),
            coverStartDate: '9999-02-01T00:00:00.000Z',
            coverEndDate: '+010000-02-01T00:00:00.000Z',
          },
          validation: {
            required: ['details', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
          },
        };

        expect(body).toEqual(expected);
        expect(status).toEqual(200);
      });

      it('returns an enum error when putting the wrong type', async () => {
        const { body } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const res = await as(aMaker).put({ type: 'TEST' }).to(`${baseUrl}/${body.details._id}`);
        expect(res.status).toEqual(422);
        expect(res.body).toEqual([
          {
            status: 422,
            errCode: ERROR.ENUM_ERROR,
            errMsg: 'Unrecognised enum',
            errRef: 'type',
          },
        ]);
      });

      it(`overall status shows as "${CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS}" if some status is marked as "${CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS}"`, async () => {
        const item1 = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const item3 = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        await as(aMaker).put({ name: 'test' }).to(`${baseUrl}/${item1.body.details._id}`);
        await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item3.body.details._id}`);

        const mockQuery = { dealId: mockApplication.body._id };
        const { body, status } = await as(aMaker).get(baseUrl, mockQuery);

        expect(status).toEqual(200);
        expect(body.status).toEqual(CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS);
        expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
      });

      it(`overall status shows as "${CONSTANTS.DEAL.DEAL_STATUS.COMPLETED}" if all status is marked as "${CONSTANTS.DEAL.DEAL_STATUS.COMPLETED}"`, async () => {
        const item1 = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const item2 = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const item3 = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item1.body.details._id}`);
        await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item2.body.details._id}`);
        await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item3.body.details._id}`);

        const mockQuery = { dealId: mockApplication.body._id };
        const { body, status } = await as(aMaker).get(baseUrl, mockQuery);

        expect(status).toEqual(200);
        expect(body.status).toEqual(CONSTANTS.DEAL.DEAL_STATUS.COMPLETED);
        expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
      });
    });

    describe('with GEF_DEAL_VERSION = 0', () => {
      beforeAll(() => {
        process.env.GEF_DEAL_VERSION = '0';
      });

      afterAll(() => {
        process.env = originalEnv;
      });

      it('returns 400 when payload contains isUsingFacilityEndDate', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put({ isUsingFacilityEndDate: true }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(body).toEqual({ status: 400, message: 'Cannot add facility end date to deal version 0' });
        expect(status).toBe(400);
      });

      it('returns 400 when payload contains bankReviewDate', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put({ bankReviewDate: new Date().toISOString() }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(body).toEqual({ status: 400, message: 'Cannot add facility end date to deal version 0' });
        expect(status).toBe(400);
      });
    });

    describe('with GEF_DEAL_VERSION = 1', () => {
      beforeAll(() => {
        process.env.GEF_DEAL_VERSION = '1';
      });

      afterAll(() => {
        process.env = originalEnv;
      });

      it('returns 200 when payload is valid & contains isUsingFacilityEndDate', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        const { status } = await as(aMaker).put({ isUsingFacilityEndDate: true }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(status).toBe(200);
      });

      it('returns 200 when payload is valid & contains bankReviewDate', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        const { status } = await as(aMaker).put({ bankReviewDate: new Date().toISOString() }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(status).toBe(200);
      });

      it('returns 400 when isUsingFacilityEndDate is not a boolean', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put({ isUsingFacilityEndDate: 'true' }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(body).toEqual({ status: 400, message: 'Invalid isUsingFacilityEndDate: "true"' });
        expect(status).toEqual(400);
      });

      it('returns 400 when bankReviewDate is not a string', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put({ bankReviewDate: 1720521372395 }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(body).toEqual({ status: 400, message: 'Invalid bankReviewDate: 1720521372395' });
        expect(status).toEqual(400);
      });

      it('returns 400 when bankReviewDate is not a valid ISO-8601 string', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put({ bankReviewDate: '2024/07/09T10 - 37/15.200Z' }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(body).toEqual({ status: 400, message: 'Invalid bankReviewDate: "2024/07/09T10 - 37/15.200Z"' });
        expect(status).toEqual(400);
      });
    });
  });
});
