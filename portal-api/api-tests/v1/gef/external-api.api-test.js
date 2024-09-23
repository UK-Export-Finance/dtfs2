const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { MAKER } = require('../../../src/v1/roles/roles');

jest.unmock('../../../src/external-api/api');

const baseUrl = '/v1/gef';

describe(baseUrl, () => {
  let aMaker;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole(MAKER).one();
  });

  describe.only(`GET ${baseUrl}/company (Companies House)`, () => {
    it('Returns a mapped company profile', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/company/00000006`);
      expect(status).toEqual(200);
      expect(body.companiesHouseRegistrationNumber).toEqual(expect.any(String));
      expect(body.companyName).toEqual(expect.any(String));
      expect(body.registeredAddress).toEqual({
        addressLine1: expect.any(String),
        addressLine2: expect.any(String),
        locality: expect.any(String),
        postalCode: expect.any(String),
        country: expect.any(String),
      });
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
      const { status, body } = await as(aMaker).get(`${baseUrl}/company/AB123123`);
      expect(status).toEqual(422);
      expect(body).toEqual([{
        status: 422,
        errRef: 'regNumber',
        errCode: "company-profile-not-found",
        errMsg: 'Invalid Companies House registration number',
      }]);
    });

    it('Returns a status of 400 if invalid company number provided', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/company/123`);
      expect(status).toEqual(400);
    });
  });

  describe(`GET ${baseUrl}/address (Ordnance Survey)`, () => {
    it('Returns a list of addresses', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/address/SW1A2HQ`);
      expect(status).toEqual(200);
      expect(body[0]).toEqual({
        organisationName: expect.any(String),
        addressLine1: expect.any(String),
        addressLine2: null,
        addressLine3: null,
        country: null,
        locality: expect.any(String),
        postalCode: expect.any(String),
      });
    });

    it('Returns a not found address if the postcode was not found', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/address/AA11AA`);
      expect(status).toEqual(422);
      expect(body).toEqual([{
        status: 422,
        errCode: 'ERROR',
        errRef: 'postcode',
      }]);
    });

    it('Returns a not found address if the postcode was invalid', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/address/A1`);
      expect(status).toEqual(400);
    });
  });
});
