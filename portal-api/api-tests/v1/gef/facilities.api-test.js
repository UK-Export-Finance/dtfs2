/* eslint-disable no-underscore-dangle */

const wipeDB = require('../../wipeDB');
const { STATUS, FACILITY_TYPE, ERROR } = require('../../../src/v1/gef/enums');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
// const { expectMongoId } = require('../../expectMongoIds');

const baseUrl = '/v1/gef/facilities';
const collectionName = 'gef-facilities';
const allItems = require('../../fixtures/gef/facilities');

const applicationCollectionName = 'gef-application';
const applicationBaseUrl = '/v1/gef/application';
const applicationAllItems = require('../../fixtures/gef/application');

describe(baseUrl, () => {
  // let noRoles;
  let aMaker;
  let aChecker;
  // let anEditor;
  let applicationItem;
  let newFacility;
  let completeUpdate;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    // noRoles = testUsers().withoutAnyRoles().one();
    aMaker = testUsers().withRole('maker').one();
    aChecker = testUsers().withRole('checker').one();
    // anEditor = testUsers().withRole('editor').one();
    applicationItem = await as(aMaker).post(applicationAllItems[0]).to(applicationBaseUrl);
    newFacility = {
      status: STATUS.IN_PROGRESS,
      details: {
        _id: expect.any(String),
        applicationId: applicationItem.body._id,
        type: expect.any(String),
        hasBeenIssued: null,
        name: null,
        startOnDayOfNotice: null,
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
      },
      validation: {
        required: ['hasBeenIssued', 'name', 'startOnDayOfNotice', 'shouldCoverStartOnSubmission', 'coverStartDate', 'coverEndDate', 'monthsOfCover', 'details', 'currency', 'value', 'coverPercentage', 'interestPercentage', 'paymentType',
        ],
      },
    };
    completeUpdate = {
      hasBeenIssued: true,
      name: 'TEST',
      startOnDayOfNotice: true,
      shouldCoverStartOnSubmission: true,
      coverStartDate: new Date(),
      coverEndDate: new Date(),
      monthsOfCover: 12,
      details: ['test', 'test'],
      detailsOther: null,
      currency: 'GBP',
      value: 10000000,
      coverPercentage: 75,
      interestPercentage: 10,
      paymentType: 'IN_ARREARS_QUARTLY',
    };
  });

  beforeEach(async () => {
    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);
  });

  describe(`GET ${baseUrl}`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(baseUrl);
      expect(status).toEqual(401);
    });

    it('returns list of all items', async () => {
      await as(aMaker).post({
        applicationId: applicationItem.body._id,
        type: FACILITY_TYPE.CASH,
      }).to(baseUrl);

      await as(aMaker).post({
        applicationId: applicationItem.body._id,
        type: FACILITY_TYPE.CONTINGENT,
      }).to(baseUrl);

      const { body, status } = await as(aChecker).get(baseUrl);

      expect(body).toEqual({ status: STATUS.IN_PROGRESS, items: [newFacility, newFacility] });
      expect(status).toEqual(200);
    });

    it('returns list of item from the given application ID', async () => {
      await as(aMaker).post({
        applicationId: applicationItem.body._id,
        type: FACILITY_TYPE.CASH,
      }).to(baseUrl);

      await as(aMaker).post({
        applicationId: applicationItem.body._id,
        type: FACILITY_TYPE.CONTINGENT,
      }).to(baseUrl);

      await as(aMaker).post({
        applicationId: 'shouldNotBeInTheList',
        type: FACILITY_TYPE.CONTINGENT,
      }).to(baseUrl);

      const { body, status } = await as(aChecker).get(`${baseUrl}?applicationId=${applicationItem.body._id}`);

      expect(body).toEqual({ status: STATUS.IN_PROGRESS, items: [newFacility, newFacility] });
      expect(status).toEqual(200);
    });

    it('returns a empty object if there are no records', async () => {
      const { body } = await as(aMaker).get(`${baseUrl}?applicationId=doesnotexist`);
      expect(body).toEqual({
        status: STATUS.NOT_STARTED,
        items: [],
      });
    });
  });

  describe(`GET ${baseUrl}/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const item = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      const { status } = await as(aMaker).get(`${baseUrl}/${item.body.details._id}`);
      expect(status).toEqual(200);
    });

    it('returns an individual item', async () => {
      const item = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      const { body } = await as(aMaker).get(`${baseUrl}/${item.body.details._id}`);
      expect(body).toEqual(newFacility);
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });

  describe(`POST ${baseUrl}`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(allItems[0]).to(baseUrl);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const { status } = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      expect(status).toEqual(201);
    });

    it('returns me a new application upon creation', async () => {
      const { body } = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      expect(body).toEqual(newFacility);
    });
  });

  describe(`PUT ${baseUrl}/:id`, () => {
    beforeEach(async () => {
      await wipeDB.wipe([collectionName]);
      await wipeDB.wipe([applicationCollectionName]);
    });

    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put({}).to(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('partially update a facility ', async () => {
      const { details } = newFacility;
      const update = {
        hasBeenIssued: false,
        name: 'Matt',
        currency: 'GBP',
      };
      const item = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);
      const expected = {
        status: STATUS.IN_PROGRESS,
        details: {
          ...details,
          ...update,
          updatedAt: expect.any(Number),
        },
        validation: {
          required: ['startOnDayOfNotice', 'shouldCoverStartOnSubmission', 'coverStartDate', 'coverEndDate', 'monthsOfCover', 'details', 'value', 'coverPercentage', 'interestPercentage', 'paymentType'],
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
      const item = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);

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
        startOnDayOfNotice: true,
        shouldCoverStartOnSubmission: true,
        coverStartDate: null,
        coverEndDate: '2015-01-01T00:00:00.000Z',
        monthsOfCover: 12,
        details: ['test'],
        detailsOther: null,
        currency: 'GBP',
        value: 10000000,
        coverPercentage: 80,
        interestPercentage: 40,
        paymentType: 'IN_ADVANCE_QUARTERLY',
      };
      const item = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);
      const expected = {
        status: STATUS.COMPLETED,
        details: {
          ...details,
          ...update,
          updatedAt: expect.any(Number),
        },
        validation: {
          required: [],
        },
      };

      expect(body).toEqual(expected);
      expect(status).toEqual(200);
    });

    it('other description is required if I select the other checkmark', async () => {
      const { details } = newFacility;
      const update = {
        details: ['other'],
      };
      const item = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.details._id}`);
      const expected = {
        status: STATUS.IN_PROGRESS,
        details: {
          ...details,
          ...update,
          updatedAt: expect.any(Number),
        },
        validation: {
          required: ['hasBeenIssued', 'name', 'startOnDayOfNotice', 'shouldCoverStartOnSubmission', 'coverStartDate', 'coverEndDate', 'monthsOfCover', 'detailsOther', 'currency', 'value', 'coverPercentage', 'interestPercentage', 'paymentType'],
        },
      };

      expect(body).toEqual(expected);
      expect(status).toEqual(200);
    });

    it('completely update a facility ', async () => {
      const { details } = newFacility;
      const item = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      const { status, body } = await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item.body.details._id}`);
      const expected = {
        status: STATUS.COMPLETED,
        details: {
          ...details,
          ...completeUpdate,
          coverStartDate: null,
          coverEndDate: expect.any(String),
          updatedAt: expect.any(Number),
        },
        validation: {
          required: [],
        },
      };

      expect(body).toEqual(expected);
      expect(status).toEqual(200);
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).put({}).to(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });

  describe(`DELETE ${baseUrl}/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const { body } = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      const { status } = await as(aMaker).remove(`${baseUrl}/${String(body.details._id)}`);
      expect(status).toEqual(200);
      expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
    });

    it('removes all items by application ID', async () => {
      const { body } = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      const { status } = await as(aMaker).remove(`${baseUrl}?applicationId=${applicationItem.body._id}`);
      expect(status).toEqual(200);
      expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).remove(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });

  describe(`Overall Status: ${baseUrl}`, () => {
    it(`overall status shows as "${STATUS.NOT_STARTED}" if all status is marked as "${STATUS.NOT_STARTED}"`, async () => {
      await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      const { body, status } = await as(aMaker).get(baseUrl);
      expect(status).toEqual(200);
      expect(body.status).toEqual(STATUS.IN_PROGRESS);
      expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
    });

    it(`overall status shows as "${STATUS.IN_PROGRESS}" if some status is marked as "${STATUS.IN_PROGRESS}"`, async () => {
      const item1 = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      const item3 = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      await as(aMaker).put({ name: 'test' }).to(`${baseUrl}/${item1.body.details._id}`);
      await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item3.body.details._id}`);
      const { body, status } = await as(aMaker).get(baseUrl);
      expect(status).toEqual(200);
      expect(body.status).toEqual(STATUS.IN_PROGRESS);
      expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
    });

    it(`overall status shows as "${STATUS.COMPLETED}" if all status is marked as "${STATUS.COMPLETED}"`, async () => {
      const item1 = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      const item2 = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      const item3 = await as(aMaker).post({ applicationId: applicationItem.body._id, type: FACILITY_TYPE.CASH }).to(baseUrl);
      await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item1.body.details._id}`);
      await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item2.body.details._id}`);
      await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item3.body.details._id}`);
      const { body, status } = await as(aMaker).get(baseUrl);
      expect(status).toEqual(200);
      expect(body.status).toEqual(STATUS.COMPLETED);
      expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
    });
  });

  describe('ENUM errors', () => {
    it('returns an enum error when putting the wrong type', async () => {
      const { status, body } = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 'TEST' }).to(baseUrl);
      expect(status).toEqual(422);
      expect(body).toEqual([{
        errCode: ERROR.ENUM_ERROR,
        errMsg: 'Unrecognised enum',
        errRef: 'type',
      }]);
    });
    it('returns an enum error when putting the payment type', async () => {
      const { status, body } = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 'CASH', paymentType: 'TEST' }).to(baseUrl);
      expect(status).toEqual(422);
      expect(body).toEqual([{
        errCode: ERROR.ENUM_ERROR,
        errMsg: 'Unrecognised enum',
        errRef: 'paymentType',
      }]);
    });
  });

  describe('Mandatory errors', () => {
    it('returns an mandator error when an application ID is missing', async () => {
      const { status, body } = await as(aMaker).post({ type: 'TEST' }).to(baseUrl);
      expect(status).toEqual(422);
      expect(body).toEqual([{
        errCode: ERROR.MANDATORY_FIELD,
        errMsg: 'No Application ID and/or facility type sent with request',
      }]);
    });
    it('returns an mandator error when facilty type is missing', async () => {
      const { status, body } = await as(aMaker).post({ applicationId: applicationItem.body._id }).to(baseUrl);
      expect(status).toEqual(422);
      expect(body).toEqual([{
        errCode: ERROR.MANDATORY_FIELD,
        errMsg: 'No Application ID and/or facility type sent with request',
      }]);
    });
  });
});
