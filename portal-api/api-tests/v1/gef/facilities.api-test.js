const wipeDB = require('../../wipeDB');
const CONSTANTS = require('../../../src/constants');
const {
  FACILITY_TYPE,
  FACILITY_PAYMENT_TYPE,
  ERROR,
} = require('../../../src/v1/gef/enums');

const app = require('../../../src/createApp');// TODO LukMar
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, CHECKER, READ_ONLY, DATA_ADMIN, ADMIN } = require('../../../src/v1/roles/roles');

const { as, get } = require('../../api')(app);

const baseUrl = '/v1/gef/facilities';
const mockFacilities = require('../../fixtures/gef/facilities');

const applicationBaseUrl = '/v1/gef/application';
const mockApplications = require('../../fixtures/gef/application');

const {
  calculateUkefExposure,
  calculateGuaranteeFee,
} = require('../../../src/v1/gef/calculations/facility-calculations');
const { roundNumber } = require('../../../src/utils/number');

describe(baseUrl, () => {
  let aMaker;
  let mockApplication;
  let newFacility;
  let completeUpdate;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole('maker').one();
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
      currency: { id: CONSTANTS.CURRENCY.CURRENCY.GBP },
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

  beforeEach(async () => {
    await wipeDB.wipe(['facilities', 'deals']);
  });

  describe(`GET ${baseUrl}?dealId=`, () => {
    const facilitiesUrl = `${baseUrl}?dealId=620a1aa095a618b12da38c7b`;

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(facilitiesUrl),
      makeRequestWithAuthHeader: (authHeader) => get(facilitiesUrl, { headers: { Authorization: authHeader } })
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, DATA_ADMIN, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
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
      const { body: { details: { _id: createdFacilityId } } } = await as(aMaker)
        .post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false })
        .to(baseUrl);
      oneFacilityUrl = `${baseUrl}/${createdFacilityId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(oneFacilityUrl),
      makeRequestWithAuthHeader: (authHeader) => get(oneFacilityUrl, { headers: { Authorization: authHeader } })
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, DATA_ADMIN, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).one(),
      getUserWithoutAnyRoles: () => testUsers().withoutAnyRoles().one(),
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

  describe(`POST ${baseUrl}`, () => {
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
  });

  describe(`PUT ${baseUrl}/:id`, () => {
    beforeEach(async () => {
      await wipeDB.wipe(['facilities', 'deals']);
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
        currency: { id: CONSTANTS.CURRENCY.CURRENCY.GBP },
      };
      const item = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

      const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);

      const expected = {
        status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
        details: {
          ...details,
          hasBeenIssued: false,
          name: 'Test',
          currency: { id: CONSTANTS.CURRENCY.CURRENCY.GBP },
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
        currency: { id: CONSTANTS.CURRENCY.CURRENCY.GBP },
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
        currency: { id: CONSTANTS.CURRENCY.CURRENCY.GBP },
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

      expected.details.currency = { id: CONSTANTS.CURRENCY.CURRENCY.GBP };

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
          required: ['monthsOfCover', 'detailsOther', 'currency', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
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

      expected.details.currency = { id: CONSTANTS.CURRENCY.CURRENCY.GBP };

      expect(body).toEqual(expected);
      expect(status).toEqual(200);
    });

    it('updates the associated deal\'s facilitiesUpdated timestamp', async () => {
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
        currency: { id: CONSTANTS.CURRENCY.CURRENCY.GBP },
        coverStartDate: 'July 19, 2022',
        coverEndDate: 'July 19, 2050'
      };
      const item = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

      const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);

      const expected = {
        status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
        details: {
          ...details,
          hasBeenIssued: true,
          name: 'Test',
          currency: { id: CONSTANTS.CURRENCY.CURRENCY.GBP },
          updatedAt: expect.any(Number),
          coverStartDate: '2022-07-19T00:00:00.000Z',
          coverEndDate: '2050-07-19T00:00:00.000Z'
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
        currency: { id: CONSTANTS.CURRENCY.CURRENCY.GBP },
        coverStartDate: 'February 29, 2024',
        coverEndDate: 'February 29, 2040'
      };
      const item = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

      const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);

      const expected = {
        status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
        details: {
          ...details,
          hasBeenIssued: true,
          name: 'Test',
          currency: { id: CONSTANTS.CURRENCY.CURRENCY.GBP },
          updatedAt: expect.any(Number),
          coverStartDate: '2024-02-29T00:00:00.000Z',
          coverEndDate: '2040-02-29T00:00:00.000Z'
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
        currency: { id: CONSTANTS.CURRENCY.CURRENCY.GBP },
        coverStartDate: 'February 01, 9999',
        coverEndDate: 'February 01, 10000'
      };
      const item = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

      const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);

      const expected = {
        status: CONSTANTS.DEAL.DEAL_STATUS.IN_PROGRESS,
        details: {
          ...details,
          hasBeenIssued: true,
          name: 'Test',
          currency: { id: CONSTANTS.CURRENCY.CURRENCY.GBP },
          updatedAt: expect.any(Number),
          coverStartDate: '9999-02-01T00:00:00.000Z',
          coverEndDate: '+010000-02-01T00:00:00.000Z'
        },
        validation: {
          required: ['details', 'value', 'coverPercentage', 'interestPercentage', 'feeType', 'feeFrequency', 'dayCountBasis'],
        },
      };

      expect(body).toEqual(expected);
      expect(status).toEqual(200);
    });
  });

  describe(`DELETE ${baseUrl}/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const { body } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
      const { status } = await as(aMaker).remove(`${baseUrl}/${String(body.details._id)}`);
      expect(status).toEqual(200);
      expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
    });

    it('removes all items by application ID', async () => {
      const { body } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
      const { status } = await as(aMaker).remove(`${baseUrl}?dealId=${mockApplication.body._id}`);
      expect(status).toEqual(200);
      expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).remove(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });

  describe(`Overall Status: ${baseUrl}`, () => {
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

  describe('ENUM errors', () => {
    describe('POST', () => {
      it('returns an enum error when putting the wrong type', async () => {
        const { status, body } = await as(aMaker).post({ dealId: mockApplication.body._id, type: 'TEST' }).to(baseUrl);
        expect(status).toEqual(422);
        expect(body).toEqual([{
          status: 422,
          errCode: ERROR.ENUM_ERROR,
          errMsg: 'Unrecognised enum',
          errRef: 'type',
        }]);
      });
    });
    describe('PUT', () => {
      it('returns an enum error when putting the wrong type', async () => {
        const { body } = await as(aMaker).post({ dealId: mockApplication.body._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);
        const res = await as(aMaker).put({ type: 'TEST' }).to(`${baseUrl}/${body.details._id}`);
        expect(res.status).toEqual(422);
        expect(res.body).toEqual([{
          status: 422,
          errCode: ERROR.ENUM_ERROR,
          errMsg: 'Unrecognised enum',
          errRef: 'type',
        }]);
      });
    });
  });

  describe('Mandatory errors', () => {
    it('returns an mandator error when an application ID is missing', async () => {
      const { status, body } = await as(aMaker).post({ type: 'TEST' }).to(baseUrl);
      expect(status).toEqual(422);
      expect(body).toEqual([{
        status: 422,
        errCode: ERROR.MANDATORY_FIELD,
        errMsg: 'No Application ID and/or facility type sent with request',
      }]);
    });
    it('returns an mandator error when facility type is missing', async () => {
      const { status, body } = await as(aMaker).post({ dealId: mockApplication.body._id }).to(baseUrl);
      expect(status).toEqual(422);
      expect(body).toEqual([{
        status: 422,
        errCode: ERROR.MANDATORY_FIELD,
        errMsg: 'No Application ID and/or facility type sent with request',
      }]);
    });
  });

  describe('calculateUkefExposure', () => {
    describe('when value and coverPercentage is present in the requested update', () => {
      it('should calculate based on the provided values', () => {
        const update = {
          value: '1234',
          coverPercentage: '25',
        };
        const existingFacility = {};

        const result = calculateUkefExposure(update, existingFacility);

        const expected = Number(update.value) * (Number(update.coverPercentage) / 100);
        expect(result).toEqual(expected);
      });

      describe('when the calculated value generated from requested update contains more than 2 decimals', () => {
        describe('when value and coverPercentage is present in the requested update', () => {
          it('should calculate and round the number based on the provided values', () => {
            const update = {
              value: '1234567',
              coverPercentage: '70',
            };
            const existingFacility = {};

            const result = calculateUkefExposure(update, existingFacility);

            const calculation = Number(update.value) * (Number(update.coverPercentage) / 100);

            const expected = roundNumber(calculation);
            expect(result).toEqual(expected);
          });
        });
      });
    });

    describe('when value and coverPercentage is NOT present in the requested update', () => {
      it('should calculate with existing values', () => {
        const update = {};
        const existingFacility = {
          value: 1234,
          coverPercentage: 25,
        };

        const result = calculateUkefExposure(update, existingFacility);

        const expected = existingFacility.value * (existingFacility.coverPercentage / 100);
        expect(result).toEqual(expected);
      });
    });
  });

  describe('calculateGuaranteeFee', () => {
    describe('when interestPercentage is present in the requested update', () => {
      it('should calculate using the the provided interestPercentage, limited to 3 decimal points', () => {
        const update = {
          interestPercentage: '25',
        };
        const existingFacility = {};

        const result = calculateGuaranteeFee(update, existingFacility);

        const calculation = (0.9 * Number(update.interestPercentage));
        const expected = Number(calculation.toFixed(3));

        expect(result).toEqual(expected);
      });
    });

    describe('when interestPercentage is NOT present in the requested update', () => {
      it('should calculate with existing interestPercentage', () => {
        const update = {};
        const existingFacility = {
          interestPercentage: 25,
        };

        const result = calculateGuaranteeFee(update, existingFacility);

        const calculation = (0.9 * Number(existingFacility.interestPercentage));
        const expected = Number(calculation.toFixed(3));

        expect(result).toEqual(expected);
      });
    });
  });
});
