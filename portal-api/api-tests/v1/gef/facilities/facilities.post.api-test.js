const { getCurrentGefDealVersion, FACILITY_TYPE } = require('@ukef/dtfs2-common');
const databaseHelper = require('../../../database-helper');
const CONSTANTS = require('../../../../src/constants');
const { ERROR } = require('../../../../src/v1/gef/enums');

const app = require('../../../../src/createApp');
const testUserCache = require('../../../api-test-users');
const { MAKER } = require('../../../../src/v1/roles/roles');

const { as } = require('../../../api')(app);

const baseUrl = '/v1/gef/facilities';
const mockFacilities = require('../../../fixtures/gef/facilities');

const applicationBaseUrl = '/v1/gef/application';
const mockApplications = require('../../../fixtures/gef/application');

const { DB_COLLECTIONS } = require('../../../fixtures/constants');
const { generateANewFacility } = require('./helpers/generate-a-new-facility.tests');

jest.mock('@ukef/dtfs2-common', () => ({
  ...jest.requireActual('@ukef/dtfs2-common'),
  getCurrentGefDealVersion: jest.fn(),
}));

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
  });

  describe(`POST ${baseUrl}`, () => {
    describe.each([0, 1])('with GEF_DEAL_VERSION = %s', (dealVersion) => {
      beforeEach(async () => {
        jest.mocked(getCurrentGefDealVersion).mockReturnValue(dealVersion);
        mockApplication = await as(aMaker).post(mockApplications[0]).to(applicationBaseUrl);
        newFacility = generateANewFacility({ dealId: mockApplication.body._id, makerId: aMaker._id, dealVersion });
      });

      afterEach(() => {
        jest.resetAllMocks();
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

    describe(`with GEF_DEAL_VERSION = 0`, () => {
      beforeEach(async () => {
        jest.mocked(getCurrentGefDealVersion).mockReturnValue(0);
        mockApplication = await as(aMaker).post(mockApplications[0]).to(applicationBaseUrl);
      });

      afterEach(() => {
        jest.resetAllMocks();
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

      it('returns 400 when payload contains facilityEndDate', async () => {
        const { status, body } = await as(aMaker)
          .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, facilityEndDate: new Date().toISOString() })
          .to(baseUrl);

        expect(body).toEqual({ status: 400, message: 'Cannot add facility end date to deal version 0' });
        expect(status).toBe(400);
      });
    });

    describe(`with GEF_DEAL_VERSION = 1`, () => {
      beforeEach(async () => {
        jest.mocked(getCurrentGefDealVersion).mockReturnValue(1);
        mockApplication = await as(aMaker).post(mockApplications[0]).to(applicationBaseUrl);
      });

      afterEach(() => {
        jest.resetAllMocks();
      });

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

      it('returns 201 when payload is valid & contains facilityEndDate', async () => {
        const { status } = await as(aMaker)
          .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, facilityEndDate: new Date().toISOString() })
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

      it('returns 400 when facilityEndDate is not a string', async () => {
        const { status, body } = await as(aMaker)
          .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, facilityEndDate: 1720521372395 })
          .to(baseUrl);

        expect(body).toEqual({ status: 400, message: 'Invalid facilityEndDate: 1720521372395' });
        expect(status).toEqual(400);
      });

      it('returns 400 when facilityEndDate is not a valid ISO-8601 string', async () => {
        const { status, body } = await as(aMaker)
          .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, facilityEndDate: '2024/07/09T10 - 37/15.200Z' })
          .to(baseUrl);

        expect(body).toEqual({ status: 400, message: 'Invalid facilityEndDate: "2024/07/09T10 - 37/15.200Z"' });
        expect(status).toEqual(400);
      });

      it('returns 400 when payload contains facilityEndDate & bankReviewDate', async () => {
        const bankReviewDate = new Date().toISOString();
        const facilityEndDate = new Date().toISOString();

        const { status, body } = await as(aMaker)
          .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, facilityEndDate, bankReviewDate })
          .to(baseUrl);

        expect(body).toEqual({ status: 400, message: 'A facility cannot have both a facilityEndDate and bankReviewDate' });
        expect(status).toEqual(400);
      });

      it('returns 400 when payload contains facilityEndDate & isUsingFacilityEndDate = false', async () => {
        const facilityEndDate = new Date().toISOString();

        const { status, body } = await as(aMaker)
          .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, facilityEndDate, isUsingFacilityEndDate: false })
          .to(baseUrl);

        expect(body).toEqual({ status: 400, message: `Invalid facilityEndDate: ${JSON.stringify(facilityEndDate)}` });
        expect(status).toEqual(400);
      });

      it('returns 400 when payload contains bankReviewDate & isUsingFacilityEndDate = true', async () => {
        const bankReviewDate = new Date().toISOString();

        const { status, body } = await as(aMaker)
          .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false, bankReviewDate, isUsingFacilityEndDate: true })
          .to(baseUrl);

        expect(body).toEqual({ status: 400, message: `Invalid bankReviewDate: ${JSON.stringify(bankReviewDate)}` });
        expect(status).toEqual(400);
      });
    });
  });
});
