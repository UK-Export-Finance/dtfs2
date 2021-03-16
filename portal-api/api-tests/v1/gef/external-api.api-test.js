/* eslint-disable no-underscore-dangle */

const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
// const { expectMongoId } = require('../../expectMongoIds');

const baseUrl = '/v1/gef';
// const collectionName = 'gef-application';

// const allItems = require('../../fixtures/gef/application');

describe(baseUrl, () => {
  // let noRoles;
  let aMaker;
  let aChecker;
  // let anEditor;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    // noRoles = testUsers().withoutAnyRoles().one();
    aMaker = testUsers().withRole('maker').one();
    aChecker = testUsers().withRole('checker').one();
    // anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    // await wipeDB.wipe([collectionName]);
  });

  describe(`GET ${baseUrl}/company (Companies House)`, () => {
    it('Returns a company profile', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/company/00000006`);
      expect(status).toEqual(200);
    });

    it('Returns a not found company profile', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/company/not-found`);
      expect(status).toEqual(404);
      expect(body).toEqual([{
        error: 'company-profile-not-found',
        type: 'ch:service',
      }]);
    });
  });

  describe(`GET ${baseUrl}/address (Ordnance Survey)`, () => {
    it('Returns a list of addresses', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/address/WR90DJ`);
      expect(status).toEqual(200);
    });

    it('Returns a not found address if the postcode was invalid', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/address/xyz`);
      expect(status).toEqual(400);
      expect(body).toEqual({
        statuscode: 400,
        message: 'Requested postcode must contain a minimum of the sector plus 1 digit of the district e.g. SO1. Requested postcode was xyz',
      });
    });

    it('Returns a not found address if the postcode was invalid', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/address/AB11AB`);
      expect(status).toEqual(200);
      expect(body).toEqual({});
    });
  });
});
