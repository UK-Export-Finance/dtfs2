/* eslint-disable no-underscore-dangle */

// const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
// const { expectMongoId } = require('../../expectMongoIds');

const baseUrl = '/v1/gef';
// const collectionName = 'deals';

// const allItems = require('../../fixtures/gef/application');

xdescribe(baseUrl, () => {
  // let noRoles;
  let aMaker;
  // let aChecker;
  // let anEditor;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    // noRoles = testUsers().withoutAnyRoles().one();
    aMaker = testUsers().withRole('maker').one();
    // aChecker = testUsers().withRole('checker').one();
    // anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    // await wipeDB.wipe([collectionName]);
  });

  describe(`GET ${baseUrl}/company (Companies House)`, () => {
    it('Returns a company profile', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/company/00000006`);
      expect(status).toEqual(200);
      expect(body.company_name).toEqual(expect.any(String));
      expect(body.company_number).toEqual(expect.any(String));
      expect(body.registered_office_address).toEqual({
        postal_code: expect.any(String),
        address_line_2: expect.any(String),
        country: expect.any(String),
        address_line_1: expect.any(String),
        locality: expect.any(String),
      });
    });

    it('Returns a not found company profile', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/company/not-found`);
      expect(status).toEqual(422);
      expect(body).toEqual({
        errCode: 'company-profile-not-found',
        errRef: 'regNumber',
        errMsg: 'Invalid Companies House registration number',
      });
    });
  });

  describe(`GET ${baseUrl}/address (Ordnance Survey)`, () => {
    it('Returns a list of addresses', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/address/E145HQ`);
      expect(status).toEqual(200);
      expect(body[0]).toEqual({
        organisation_name: expect.any(String),
        address_line_1: expect.any(String),
        address_line_2: null,
        locality: expect.any(String),
        postal_code: expect.any(String),
      });
    });

    it('Returns a not found address if the postcode was invalid', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/address/xyz`);
      expect(status).toEqual(422);
      expect(body).toEqual({
        errCode: 'ERROR',
        errRef: 'postcode',
        errMsg: 'Requested postcode must contain a minimum of the sector plus 1 digit of the district e.g. SO1. Requested postcode was xyz',
      });
    });
  });
});
