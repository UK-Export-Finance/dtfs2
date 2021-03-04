/* eslint-disable no-underscore-dangle */

const wipeDB = require('../../wipeDB');

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
      status: 0,
      details: {
        _id: expect.any(String),
        applicationId: applicationItem.body._id,
        type: expect.any(Number),
        hasBeenIssued: null,
        name: null,
        startOnDayOfNotice: null,
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
        updatedAt: null,
      },
      validation: {
        required: ['hasBeenIssued', 'name', 'startOnDayOfNotice', 'coverStartDate', 'coverEndDate', 'monthsOfCover', 'details', 'currency', 'value', 'coverPercentage', 'interestPercentage', 'paymentType',
        ],
      },
    };
    completeUpdate = {
      hasBeenIssued: true,
      name: 'TEST',
      startOnDayOfNotice: true,
      coverStartDate: new Date(),
      coverEndDate: new Date(),
      monthsOfCover: 12,
      details: ['test', 'test'],
      detailsOther: null,
      currency: 'GBP',
      value: 10000000,
      coverPercentage: 75,
      interestPercentage: 10,
      paymentType: 0,
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
        type: 0,
      }).to(baseUrl);

      await as(aMaker).post({
        applicationId: applicationItem.body._id,
        type: 1,
      }).to(baseUrl);

      const { body, status } = await as(aChecker).get(baseUrl);

      expect(body).toEqual({ status: 0, items: [newFacility, newFacility] });
      expect(status).toEqual(200);
    });

    it('returns list of item from the given application ID', async () => {
      await as(aMaker).post({
        applicationId: applicationItem.body._id,
        type: 0,
      }).to(baseUrl);

      await as(aMaker).post({
        applicationId: applicationItem.body._id,
        type: 1,
      }).to(baseUrl);

      await as(aMaker).post({
        applicationId: 'shouldNotBeInTheList',
        type: 1,
      }).to(baseUrl);

      const { body, status } = await as(aChecker).get(`${baseUrl}?applicationId=${applicationItem.body._id}`);

      expect(body).toEqual({ status: 0, items: [newFacility, newFacility] });
      expect(status).toEqual(200);
    });

    it('returns a empty object if there are no records', async () => {
      const { body } = await as(aMaker).get(`${baseUrl}?applicationId=doesnotexist`);
      expect(body).toEqual({
        status: 0,
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
      const item = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      const { status } = await as(aMaker).get(`${baseUrl}/${item.body._id}`);
      expect(status).toEqual(200);
    });

    it('returns an individual item', async () => {
      const item = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      const { body } = await as(aMaker).get(`${baseUrl}/${item.body._id}`);
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
      const { status } = await as(aMaker).post(allItems[0]).to(baseUrl);
      expect(status).toEqual(201);
    });

    it('returns me a new application upon creation', async () => {
      const { body } = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      expect(body).toEqual(newFacility.details);
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
      const item = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body._id}`);
      const expected = {
        status: 1,
        details: {
          ...details,
          ...update,
          updatedAt: expect.any(Number),
        },
        validation: {
          required: ['startOnDayOfNotice', 'coverStartDate', 'coverEndDate', 'monthsOfCover', 'details','value', 'coverPercentage', 'interestPercentage', 'paymentType'],
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
      const item = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body._id}`);
      const expected = {
        status: 1,
        details: {
          ...details,
          ...update,
          updatedAt: expect.any(Number),
        },
        validation: {
          required: ['hasBeenIssued', 'name', 'startOnDayOfNotice', 'coverStartDate', 'coverEndDate', 'monthsOfCover', 'detailsOther', 'currency', 'value', 'coverPercentage', 'interestPercentage', 'paymentType'],
        },
      };

      expect(body).toEqual(expected);
      expect(status).toEqual(200);
    });

    it('completely update a facility ', async () => {
      const { details } = newFacility;
      const item = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      const { status, body } = await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item.body._id}`);
      const expected = {
        status: 2,
        details: {
          ...details,
          ...completeUpdate,
          coverStartDate: expect.any(String),
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
      const { body } = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      const { status } = await as(aMaker).remove(`${baseUrl}/${String(body._id)}`);
      expect(status).toEqual(200);
      expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
    });

    it('removes all items by application ID', async () => {
      const { body } = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
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
    it('overall status shows as "NOT STARTED" if all status is marked as "NOT STARTED"', async () => {
      await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      const { body, status } = await as(aMaker).get(baseUrl);
      expect(status).toEqual(200);
      expect(body.status).toEqual(0);
      expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
    });

    it('overall status shows as "IN PROGRES" if some status is marked as "IN PROGRES"', async () => {
      const item1 = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      const item3 = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      await as(aMaker).put({name: 'test'}).to(`${baseUrl}/${item1.body._id}`);
      await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item3.body._id}`);
      const { body, status } = await as(aMaker).get(baseUrl);
      expect(status).toEqual(200);
      expect(body.status).toEqual(1);
      expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
    });

    it('overall status shows as "COMPLETED" if all status is marked as "COMPLETED"', async () => {
      const item1 = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      const item2 = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      const item3 = await as(aMaker).post({ applicationId: applicationItem.body._id, type: 0 }).to(baseUrl);
      await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item1.body._id}`);
      await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item2.body._id}`);
      await as(aMaker).put(completeUpdate).to(`${baseUrl}/${item3.body._id}`);
      const { body, status } = await as(aMaker).get(baseUrl);
      expect(status).toEqual(200);
      expect(body.status).toEqual(2);
      expect(body).not.toEqual({ success: false, msg: "you don't have the right role" });
    });
  });
});
