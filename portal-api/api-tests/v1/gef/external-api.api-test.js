const { HttpStatusCode } = require('axios');
const { ADDRESSES } = require('@ukef/dtfs2-common');
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

  describe(`GET ${baseUrl}/company (Companies House)`, () => {
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
      const { status, body } = await as(aMaker).get(`${baseUrl}/company/1111111`);
      expect(status).toEqual(HttpStatusCode.UnprocessableEntity);
      expect(body).toEqual([
        {
          status: HttpStatusCode.UnprocessableEntity,
          errCode: 'company-profile-not-found',
          errRef: 'regNumber',
          errMsg: 'Invalid Companies House registration number',
        },
      ]);
    });

    it('Returns a status of 400 if invalid company number provided', async () => {
      const { status } = await as(aMaker).get(`${baseUrl}/company/123`);
      expect(status).toEqual(HttpStatusCode.BadRequest);
    });
  });

  describe(`GET ${baseUrl}/address (Geospatial Addresses)`, () => {
    beforeEach(() => {
      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('Returns a list of addresses', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/address/${ADDRESSES.EXAMPLES.POSTCODE_WITHOUT_SPACE}`);
      expect(status).toEqual(HttpStatusCode.Ok);
      expect(body[0]).toEqual({
        organisationName: expect.any(String),
        addressLine1: expect.any(String),
        addressLine2: null,
        addressLine3: null,
        country: expect.any(String),
        locality: expect.any(String),
        postalCode: expect.any(String),
      });
    });

    it('Returns a not found address if the postcode was not found', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/address/AA11AA`);
      expect(status).toEqual(HttpStatusCode.UnprocessableEntity);
      expect(body).toEqual([
        {
          status: HttpStatusCode.UnprocessableEntity,
          errMsg: {},
          errCode: 'ERROR',
          errRef: 'postcode',
        },
      ]);
    });

    it('Returns an invalid postcode error, if the postcode specified is invalid', async () => {
      const { status, body } = await as(aMaker).get(`${baseUrl}/address/A1`);
      expect(status).toEqual(HttpStatusCode.BadRequest);
      expect(body).toEqual([
        {
          status: HttpStatusCode.BadRequest,
          errMsg: 'Invalid postcode',
          errCode: 'ERROR',
          errRef: 'postcode',
        },
      ]);
    });

    it('returns a 422 response if backend returns 500', async () => {
      jest.mock('../../../src/external-api/api', () => ({
        geospatialAddresses: {
          getAddressesByPostcode: () => ({ status: HttpStatusCode.InternalServerError }),
        },
      }));

      const { status, body } = await as(aMaker).get(`${baseUrl}/address/${ADDRESSES.EXAMPLES.POSTCODE_WITHOUT_SPACE}`);

      expect(status).toEqual(HttpStatusCode.UnprocessableEntity);
      expect(body).toEqual([
        {
          status: HttpStatusCode.UnprocessableEntity,
          errMsg: {},
          errCode: 'ERROR',
          errRef: 'postcode',
        },
      ]);
    });
  });
});
