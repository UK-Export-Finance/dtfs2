const { HttpStatusCode } = require('axios');
const { CURRENCY, getCurrentGefDealVersion, FACILITY_TYPE } = require('@ukef/dtfs2-common');
const databaseHelper = require('../../../database-helper');
const CONSTANTS = require('../../../../src/constants');
const { FACILITY_PAYMENT_TYPE, ERROR } = require('../../../../src/v1/gef/enums');

const app = require('../../../../src/createApp');
const testUserCache = require('../../../api-test-users');
const { MAKER } = require('../../../../src/v1/roles/roles');

const { as } = require('../../../api')(app);

const baseUrl = '/v1/gef/facilities';

const applicationBaseUrl = '/v1/gef/application';
const mockApplications = require('../../../fixtures/gef/application');

const { calculateUkefExposure, calculateGuaranteeFee } = require('../../../../src/v1/gef/calculations/facility-calculations');
const { DB_COLLECTIONS } = require('../../../fixtures/constants');
const { generateANewFacility } = require('./helpers/generate-a-new-facility.tests');
const { generateACompleteFacilityUpdate } = require('./helpers/generate-a-facility-update.tests');

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  getCurrentGefDealVersion: jest.fn(),
}));

describe(baseUrl, () => {
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
  });

  describe(`PUT ${baseUrl}/:id`, () => {
    describe.each([0, 1])('with GEF_DEAL_VERSION = %s', (dealVersion) => {
      beforeEach(async () => {
        jest.mocked(getCurrentGefDealVersion).mockReturnValue(dealVersion);
        mockApplication = await as(aMaker).post(mockApplications[0]).to(applicationBaseUrl);
        newFacility = generateANewFacility({ dealId: mockApplication.body._id, makerId: aMaker._id, dealVersion });
        completeUpdate = generateACompleteFacilityUpdate({ dealVersion });
      });

      afterEach(() => {
        jest.resetAllMocks();
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
            required: addFacilityEndDateToValidation(
              ['monthsOfCover', 'details', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
              dealVersion,
            ),
          },
        };

        expect(body).toEqual(expected);
        expect(status).toEqual(HttpStatusCode.Ok);
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
        expect(res1.status).toEqual(HttpStatusCode.Ok);
        expect(res1.body.details.shouldCoverStartOnSubmission).toEqual(false);
        expect(res1.body.details.coverStartDate).toEqual(expect.any(String));
        expect(res1.body.details.coverEndDate).toEqual(expect.any(String));

        // second update - remove start date
        const res2 = await as(aMaker).put(secondUpdate).to(`${baseUrl}/${item.body.details._id}`);
        expect(res2.status).toEqual(HttpStatusCode.Ok);
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
            required: addFacilityEndDateToValidation([], dealVersion),
          },
        };

        expected.details.currency = update.currency;

        expect(body).toEqual(expected);
        expect(status).toEqual(HttpStatusCode.Ok);
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
            required: addFacilityEndDateToValidation(['name'], dealVersion),
          },
        };

        expected.details.currency = { id: CURRENCY.GBP };

        expect(body).toEqual(expected);
        expect(status).toEqual(HttpStatusCode.Ok);
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
            required: addFacilityEndDateToValidation(
              ['monthsOfCover', 'detailsOther', 'currency', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
              dealVersion,
            ),
          },
        };

        expect(body).toEqual(expected);
        expect(status).toEqual(HttpStatusCode.Ok);
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
        expect(status).toEqual(HttpStatusCode.Ok);
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
            required: addFacilityEndDateToValidation(
              ['details', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
              dealVersion,
            ),
          },
        };

        expect(body).toEqual(expected);
        expect(status).toEqual(HttpStatusCode.Ok);
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
            required: addFacilityEndDateToValidation(
              ['details', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
              dealVersion,
            ),
          },
        };

        expect(body).toEqual(expected);
        expect(status).toEqual(HttpStatusCode.Ok);
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
            required: addFacilityEndDateToValidation(
              ['details', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
              dealVersion,
            ),
          },
        };

        expect(body).toEqual(expected);
        expect(status).toEqual(HttpStatusCode.Ok);
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

        expect(status).toEqual(HttpStatusCode.Ok);
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

        expect(status).toEqual(HttpStatusCode.Ok);
        expect(body.status).toEqual(CONSTANTS.DEAL.DEAL_STATUS.COMPLETED);
        expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
      });
    });

    describe('with GEF_DEAL_VERSION = 0', () => {
      beforeEach(async () => {
        jest.mocked(getCurrentGefDealVersion).mockReturnValue(0);
        mockApplication = await as(aMaker).post(mockApplications[0]).to(applicationBaseUrl);
      });

      afterEach(() => {
        jest.resetAllMocks();
      });

      it('returns 400 when payload contains isUsingFacilityEndDate', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put({ isUsingFacilityEndDate: true }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(body).toEqual({ status: 400, message: 'Cannot add facility end date to deal version 0' });
        expect(status).toEqual(400);
      });

      it('returns 400 when payload contains bankReviewDate', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put({ bankReviewDate: new Date().toISOString() }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(body).toEqual({ status: 400, message: 'Cannot add facility end date to deal version 0' });
        expect(status).toEqual(400);
      });

      it('returns 400 when payload contains facilityEndDate', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put({ bankReviewDate: new Date().toISOString() }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(body).toEqual({ status: 400, message: 'Cannot add facility end date to deal version 0' });
        expect(status).toEqual(400);
      });
    });

    describe('with GEF_DEAL_VERSION = 1', () => {
      beforeEach(async () => {
        jest.mocked(getCurrentGefDealVersion).mockReturnValue(1);
        mockApplication = await as(aMaker).post(mockApplications[0]).to(applicationBaseUrl);
      });

      afterEach(() => {
        jest.resetAllMocks();
      });

      it('returns 200 when payload is valid & contains isUsingFacilityEndDate', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        const { status } = await as(aMaker).put({ isUsingFacilityEndDate: true }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(status).toEqual(HttpStatusCode.Ok);
      });

      it('returns 200 when payload is valid & contains bankReviewDate', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        const { status } = await as(aMaker).put({ bankReviewDate: new Date().toISOString() }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(status).toEqual(HttpStatusCode.Ok);
      });

      it('returns 200 when payload is valid & contains facilityEndDate', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        const { status } = await as(aMaker).put({ facilityEndDate: new Date().toISOString() }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(status).toEqual(HttpStatusCode.Ok);
      });

      it('returns 200 when facilityEndDate & bankReviewDate are both null', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

        const { status } = await as(aMaker).put({ facilityEndDate: null, bankReviewDate: null }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(status).toEqual(HttpStatusCode.Ok);
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

      it('returns 400 when facilityEndDate is not a string', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put({ facilityEndDate: 1720521372395 }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(body).toEqual({ status: 400, message: 'Invalid facilityEndDate: 1720521372395' });
        expect(status).toEqual(400);
      });

      it('returns 400 when facilityEndDate is not a valid ISO-8601 string', async () => {
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put({ facilityEndDate: '2024/07/09T10 - 37/15.200Z' }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(body).toEqual({ status: 400, message: 'Invalid facilityEndDate: "2024/07/09T10 - 37/15.200Z"' });
        expect(status).toEqual(400);
      });

      it('returns 400 when payload contains facilityEndDate & bankReviewDate', async () => {
        const bankReviewDate = new Date().toISOString();
        const facilityEndDate = new Date().toISOString();
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put({ bankReviewDate, facilityEndDate }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(body).toEqual({ status: 400, message: 'A facility cannot have both a facilityEndDate and bankReviewDate' });
        expect(status).toEqual(400);
      });

      it('returns 400 when payload contains facilityEndDate & isUsingFacilityEndDate = false', async () => {
        const facilityEndDate = new Date().toISOString();
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put({ isUsingFacilityEndDate: false, facilityEndDate }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(body).toEqual({ status: 400, message: `Invalid facilityEndDate: ${JSON.stringify(facilityEndDate)}` });
        expect(status).toEqual(400);
      });

      it('returns 400 when payload contains bankReviewDate & isUsingFacilityEndDate = true', async () => {
        const bankReviewDate = new Date().toISOString();
        const { body: facilityBody } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const { status, body } = await as(aMaker).put({ bankReviewDate, isUsingFacilityEndDate: true }).to(`${baseUrl}/${facilityBody.details._id}`);

        expect(body).toEqual({ status: 400, message: `Invalid bankReviewDate: ${JSON.stringify(bankReviewDate)}` });
        expect(status).toEqual(400);
      });
    });
  });
});

function addFacilityEndDateToValidation(validation, dealVersion) {
  if (dealVersion === 0) {
    return validation;
  }

  const allValidationErrors = [
    'name',
    'isUsingFacilityEndDate',
    'monthsOfCover',
    'detailsOther',
    'details',
    'currency',
    'value',
    'coverPercentage',
    'interestPercentage',
    'feeType',
    'feeFrequency',
    'dayCountBasis',
  ];

  // retain order of allValidationErrors, but only return those in validation
  return allValidationErrors.filter((value) => validation.includes(value) || value === 'isUsingFacilityEndDate');
}
