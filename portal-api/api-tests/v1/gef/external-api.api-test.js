const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

const baseUrl = '/v1/gef';

xdescribe(baseUrl, () => {
  let aMaker;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole('maker').one();
  });

  describe(`GET ${baseUrl}/company (Companies House)`, () => {
    it('Returns a mapped company profile', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/company/00000006`);
      expect(status).toEqual(200);
      expect(body.companiesHouseRegistrationNumber).toEqual(expect.any(String));
      expect(body.companyName).toEqual(expect.any(String));
      expect(body.registeredAddress).toEqual({
        organisationName: expect.any(String),
        addressLine1: expect.any(String),
        addressLine2: expect.any(String),
        addressLine3: expect.any(String),
        locality: expect.any(String),
        postalCode: expect.any(String),
        country: expect.any(String),
      });
      expect(body.updatedAt).toEqual(expect.any(Number));
      expect(body.selectedIndustry.code).toEqual(expect.any(String));
      expect(body.selectedIndustry.name).toEqual(expect.any(String));
      expect(body.selectedIndustry.class).toEqual({
        code: expect.any(String),
        name: expect.any(String),
      });
      expect(body.industries[0].code).toEqual(expect.any(String));
      expect(body.industries[0].name).toEqual(expect.any(String));
      expect(body.industries[0].class).toEqual({
        code: expect.any(String),
        name: expect.any(String),
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
