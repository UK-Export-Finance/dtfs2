/* eslint-disable no-underscore-dangle */

const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId } = require('../../expectMongoIds');

const baseUrl = '/v1/gef/exporter';
const collectionName = 'gef-exporter';
const allItems = require('../../fixtures/gef/exporter');

const applicationCollectionName = 'gef-application';
const applicationBaseUrl = '/v1/gef/application';
const applicationAllItems = require('../../fixtures/gef/application');

describe(baseUrl, () => {
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
    await wipeDB.wipe([collectionName]);
    await wipeDB.wipe([applicationCollectionName]);
  });

  describe(`GET ${baseUrl}/:id`, () => {
    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const item = await as(aMaker).post(applicationAllItems[0]).to(applicationBaseUrl);
      const { status } = await as(aMaker).get(`${baseUrl}/${item.body.exporterId}`);
      expect(status).toEqual(200);
    });

    it('returns a "not started" export information', async () => {
      const item = await as(aMaker).post(applicationAllItems[1]).to(applicationBaseUrl);
      const { body } = await as(aMaker).get(`${baseUrl}/${item.body.exporterId}`);
      const expected = {
        status: 'NOT_STARTED',
        details: expectMongoId({
          companiesHouseRegistrationNumber: null,
          companyName: null,
          registeredAddress: null,
          correspondenceAddress: null,
          industrySector: null,
          industryClass: null,
          smeType: null,
          probabilityOfDefault: null,
          isFinanceIncreasing: null,
          createdAt: expect.any(Number),
          updatedAt: null,
        }),
        validation: {
          required: [
            'companiesHouseRegistrationNumber',
            'companyName',
            'registeredAddress',
            'industrySector',
            'industryClass',
            'smeType',
            'probabilityOfDefault',
            'isFinanceIncreasing',
          ],
        },
      };
      expect(body).toEqual(expected);
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });
  });

  describe(`PUT ${baseUrl}/:id`, () => {
    const updated = {
      ...allItems[0],
      companiesHouseRegistrationNumber: 1234567,
    };

    it('rejects requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(updated).to(`${baseUrl}/1`);
      expect(status).toEqual(401);
    });

    it('accepts requests that present a valid Authorization token with "maker" role', async () => {
      const item = await as(aMaker).post(applicationAllItems[2]).to(applicationBaseUrl);
      const { status } = await as(aMaker).put(updated).to(`${baseUrl}/${item.body.exporterId}`);
      expect(status).toEqual(200);
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).put(updated).to(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });

  });
});
