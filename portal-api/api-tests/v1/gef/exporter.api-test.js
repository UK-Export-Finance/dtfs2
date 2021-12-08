/* eslint-disable no-underscore-dangle */

const wipeDB = require('../../wipeDB');
const { STATUS, ERROR } = require('../../../src/v1/gef/enums');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectMongoId } = require('../../expectMongoIds');

const baseUrl = '/v1/gef/exporter';
const collectionName = 'gef-exporter';
const allItems = require('../../fixtures/gef/exporter');

const applicationCollectionName = 'deals';
const applicationBaseUrl = '/v1/gef/application';
const applicationAllItems = require('../../fixtures/gef/application');

const companiesHouseUrl = '/v1/gef/company/01003142';

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

    it(`returns a "${STATUS.NOT_STARTED}" export information`, async () => {
      const item = await as(aMaker).post(applicationAllItems[1]).to(applicationBaseUrl);
      const { body } = await as(aMaker).get(`${baseUrl}/${item.body.exporterId}`);
      const expected = {
        status: STATUS.NOT_STARTED,
        details: expectMongoId({
          companiesHouseRegistrationNumber: null,
          companyName: null,
          registeredAddress: null,
          correspondenceAddress: null,
          selectedIndustry: null,
          industries: null,
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
            'selectedIndustry',
            'industries',
            'smeType',
            'probabilityOfDefault',
            'isFinanceIncreasing',
          ],
        },
      };
      expect(body).toEqual(expected);
    });

    it(`returns a "${STATUS.IN_PROGRESS}" export information`, async () => {
      const item = await as(aMaker).post(applicationAllItems[2]).to(applicationBaseUrl);
      const { status, body } = await as(aMaker).put({
        isFinanceIncreasing: true,
      }).to(`${baseUrl}/${item.body.exporterId}`);
      const expected = {
        status: STATUS.IN_PROGRESS,
        details: expectMongoId({
          companiesHouseRegistrationNumber: null,
          companyName: null,
          registeredAddress: null,
          correspondenceAddress: null,
          selectedIndustry: null,
          industries: null,
          smeType: null,
          probabilityOfDefault: null,
          isFinanceIncreasing: true,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
        validation: {
          required: [
            'companiesHouseRegistrationNumber',
            'companyName',
            'registeredAddress',
            'selectedIndustry',
            'industries',
            'smeType',
            'probabilityOfDefault',
          ],
        },
      };
      expect(status).toEqual(200);
      expect(body).toEqual(expected);
    });

    it(`returns a "${STATUS.COMPLETED}" export information`, async () => {
      const update = {
        companiesHouseRegistrationNumber: '123456789',
        companyName: 'TEST',
        registeredAddress: {
          organisationName: null,
          addressLine1: '45 FFORDD DRYDEN',
          addressLine2: 'KILLAY',
          addressLine3: null,
          locality: 'ABERTAWE',
          postalCode: 'SA2 7PD',
          country: null,
        },
        correspondenceAddress: {
          organisationName: null,
          addressLine1: '45 FFORDD DRYDEN',
          addressLine2: 'KILLAY',
          addressLine3: null,
          locality: 'ABERTAWE',
          postalCode: 'SA2 7PD',
          country: null,
        },
        selectedIndustry: {
          code: '1003',
          name: 'Manufacturing',
          class: {
            code: '28110',
            name: 'Manufacture of engines and turbines, except aircraft, vehicle and cycle engines',
          },
        },
        industries: [{
          code: '1003',
          name: 'Manufacturing',
          class: {
            code: '25300',
            name: 'Manufacture of steam generators, except central heating hot water boilers',
          },
        },
        {
          code: '1003',
          name: 'Manufacturing',
          class: {
            code: '25620',
            name: 'Machining',
          },
        },
        {
          code: '1003',
          name: 'Manufacturing',
          class: {
            code: '28110',
            name: 'Manufacture of engines and turbines, except aircraft, vehicle and cycle engines',
          },
        }],
        smeType: 'MICRO',
        probabilityOfDefault: 50,
        isFinanceIncreasing: true,
      };
      const item = await as(aMaker).post(applicationAllItems[2]).to(applicationBaseUrl);
      const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body.exporterId}`);
      const expected = {
        status: STATUS.COMPLETED,
        details: expectMongoId({
          ...update,
          createdAt: expect.any(Number),
          updatedAt: expect.any(Number),
        }),
        validation: {
          required: [],
        },
      };
      expect(status).toEqual(200);
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
      companiesHouseRegistrationNumber: '1234567',
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

    it('returns enum error if the wrong enum is sent', async () => {
      const item = await as(aMaker).post(applicationAllItems[3]).to(applicationBaseUrl);
      const { status, body } = await as(aMaker).put({ ...updated, smeType: 'TEST' }).to(`${baseUrl}/${item.body.exporterId}`);
      expect(status).toEqual(422);
      expect(body).toEqual([{
        errCode: ERROR.ENUM_ERROR,
        errMsg: 'Unrecognised enum',
        errRef: 'smeType',
      }]);
    });

    it('returns a 204 - "No Content" if there are no records', async () => {
      const { status } = await as(aMaker).put(updated).to(`${baseUrl}/doesnotexist`);
      expect(status).toEqual(204);
    });

    it('Adds a Correspondence Address to the exporter details', async () => {
      const item = await as(aMaker).post(applicationAllItems[4]).to(applicationBaseUrl);
      const { status, body } = await as(aMaker).put({
        correspondenceAddress: {
          organisationName: null,
          addressLine1: '45 FFORDD DRYDEN',
          addressLine2: 'KILLAY',
          addressLine3: null,
          locality: 'ABERTAWE',
          postalCode: 'SA2 7PD',
          country: null,
        },
      }).to(`${baseUrl}/${item.body.exporterId}`);
      expect(status).toEqual(200);
      expect(body.details.correspondenceAddress).toBeDefined();
      expect(body.details.correspondenceAddress.organisationName).toBeDefined();
      expect(body.details.correspondenceAddress.addressLine1).toBeDefined();
      expect(body.details.correspondenceAddress.addressLine2).toBeDefined();
      expect(body.details.correspondenceAddress.locality).toBeDefined();
      expect(body.details.correspondenceAddress.postalCode).toBeDefined();
      expect(body.details.correspondenceAddress.country).toBeDefined();
    });
  });

  describe('External APIs update exporter details', () => {
    it('Adds a Registered Company Address to the exporter details', async () => {
      const item = await as(aMaker).post(applicationAllItems[5]).to(applicationBaseUrl);
      await as(aMaker).get(`${companiesHouseUrl}?exporterId=${item.body.exporterId}`);
      const { status, body } = await as(aMaker).get(`${baseUrl}/${item.body.exporterId}`);
      expect(status).toEqual(200);
      expect(body.details.registeredAddress).toBeDefined();
      expect(body.details.registeredAddress.organisationName).toBeDefined();
      expect(body.details.registeredAddress.addressLine1).toBeDefined();
      expect(body.details.registeredAddress.addressLine2).toBeDefined();
      expect(body.details.registeredAddress.locality).toBeDefined();
      expect(body.details.registeredAddress.postalCode).toBeDefined();
      expect(body.details.registeredAddress.country).toBeDefined();
    });

    it('Adds a Registered Company Name exporter details', async () => {
      const item = await as(aMaker).post(applicationAllItems[6]).to(applicationBaseUrl);
      await as(aMaker).get(`${companiesHouseUrl}?exporterId=${item.body.exporterId}`);
      const { status, body } = await as(aMaker).get(`${baseUrl}/${item.body.exporterId}`);
      expect(status).toEqual(200);
      expect(body.details.companyName).toEqual(expect.any(String));
    });

    it('Adds a Registered Company Number exporter details', async () => {
      const item = await as(aMaker).post(applicationAllItems[7]).to(applicationBaseUrl);
      await as(aMaker).get(`${companiesHouseUrl}?exporterId=${item.body.exporterId}`);
      const { status, body } = await as(aMaker).get(`${baseUrl}/${item.body.exporterId}`);
      expect(status).toEqual(200);
      expect(body.details.companiesHouseRegistrationNumber).toEqual(expect.any(String));
    });

    it('It doesn`t update exporter details without an exporterId in companies house endpoint', async () => {
      const item = await as(aMaker).post(applicationAllItems[8]).to(applicationBaseUrl);
      await as(aMaker).get(`${companiesHouseUrl}`);
      const { status, body } = await as(aMaker).get(`${baseUrl}/${item.body.exporterId}`);
      expect(status).toEqual(200);
      expect(body.details.companyName).toBeNull();
      expect(body.details.registeredAddress).toBeNull();
      expect(body.details.companiesHouseRegistrationNumber).toBeNull();
    });

    it('Adds Company SIC Codes to exporter details', async () => {
      const item = await as(aMaker).post(applicationAllItems[6]).to(applicationBaseUrl);
      await as(aMaker).get(`${companiesHouseUrl}?exporterId=${item.body.exporterId}`);
      const { status, body } = await as(aMaker).get(`${baseUrl}/${item.body.exporterId}`);
      expect(status).toEqual(200);
      expect(body.details.industries[0]).toEqual(
        {
          code: expect.any(String),
          name: expect.any(String),
          class: {
            code: expect.any(String),
            name: expect.any(String),
          },
        },
      );
    });
  });
});
