const { CURRENCY } = require('@ukef/dtfs2-common');

const databaseHelper = require('../../database-helper');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');

const { as, get } = require('../../api')(app);
const { MAKER, CHECKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

const newDeal = aDeal({
  updatedAt: Date.now(),
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  status: 'Draft',
  comments: [
    {
      username: 'bananaman',
      timestamp: '1984/12/25 00:00:00:001',
      text: 'Merry Christmas from the 80s',
    },
    {
      username: 'supergran',
      timestamp: '1982/12/25 00:00:00:001',
      text: 'Also Merry Christmas from the 80s',
    },
  ],
});

describe('/v1/deals/:id/submission-details', () => {
  let testbank2Maker;
  let testbank1Maker;
  let aSuperuser;
  let testUsers;

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    testbank1Maker = testUsers().withRole(MAKER).withBankName('Bank 1').one();
    testbank2Maker = testUsers().withRole(MAKER).withBankName('Bank 2').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);
  });

  describe('GET /v1/deals/:id/submission-details', () => {
    let oneDealSubmissionDetailsUrl;

    beforeEach(async () => {
      const {
        body: { _id: dealId },
      } = await as(testbank1Maker).post(newDeal).to('/v1/deals');
      oneDealSubmissionDetailsUrl = `/v1/deals/${dealId}/submission-details`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(oneDealSubmissionDetailsUrl),
      makeRequestWithAuthHeader: (authHeader) => get(oneDealSubmissionDetailsUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, CHECKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withBankName('Bank 1').withRole(role).one(),
      makeRequestAsUser: (user) => as(user).get(oneDealSubmissionDetailsUrl),
      successStatusCode: 200,
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const { status } = await as(testbank2Maker).get(oneDealSubmissionDetailsUrl);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await as(testbank1Maker).get('/v1/deals/620a1aa095a618b12da38c7b/submission-details');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { status } = await as(aSuperuser).get(oneDealSubmissionDetailsUrl);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const { status, body } = await as(testbank1Maker).get(oneDealSubmissionDetailsUrl);

      expect(status).toEqual(200);
      expect(body.data).toEqual({ status: 'Not started' });
    });
  });

  describe('PUT /v1/deals/:id/submission-details', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(newDeal).to('/v1/deals/620a1aa095a618b12da38c7b/submission-details');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(testUsers).put(newDeal).to('/v1/deals/620a1aa095a618b12da38c7b/submission-details');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const { body } = await as(testbank2Maker).post(newDeal).to('/v1/deals');

      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned',
      };

      const { status } = await as(testbank1Maker).put(statusUpdate).to(`/v1/deals/${body._id}/submission-details`);

      expect(status).toEqual(401);
    });

    it('returns the updated submission-details with country fields as objects', async () => {
      const postResult = await as(testbank2Maker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        supplierCompaniesHouseRegistrationNumber: '12345678',
        destinationOfGoodsAndServices: {},
        'buyer-address-country': {},
        'indemnifier-correspondence-address-country': {},
        'indemnifier-address-country': {},
        'supplier-address-country': {},
        'supplier-correspondence-address-country': {},
      };
      const expectedResponse = {
        ...submissionDetails,
        destinationOfGoodsAndServices: {},
        'buyer-address-country': {},
        'indemnifier-correspondence-address-country': {},
        'indemnifier-address-country': {},
        'supplier-address-country': {},
        'supplier-correspondence-address-country': {},
        status: 'Incomplete',
      };

      const { status, body } = await as(testbank2Maker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      expect(status).toEqual(200);
      expect(body.data).toEqual(expectedResponse);
    });

    describe('when a country field changes', () => {
      it('returns the updated submission-details with country objects', async () => {
        const postResult = await as(testbank2Maker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          destinationOfGoodsAndServices: 'GBR',
          'buyer-address-country': 'GBR',
          'indemnifier-correspondence-address-country': 'GBR',
          'indemnifier-address-country': 'GBR',
          'supplier-address-country': 'GBR',
          'supplier-correspondence-address-country': 'GBR',
        };

        const { status } = await as(testbank2Maker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);
        expect(status).toEqual(200);

        const body = {
          destinationOfGoodsAndServices: 'CAN',
          'buyer-address-country': 'CAN',
          'indemnifier-correspondence-address-country': 'CAN',
          'indemnifier-address-country': 'CAN',
          'supplier-address-country': 'CAN',
          'supplier-correspondence-address-country': 'CAN',
        };

        const updatedSubmissionDetails = await as(testbank2Maker).put(body).to(`/v1/deals/${createdDeal._id}/submission-details`);
        expect(updatedSubmissionDetails.status).toEqual(200);

        const expectedCountryObj = { name: 'Canada', code: 'CAN' };

        expect(updatedSubmissionDetails.body.data.destinationOfGoodsAndServices).toEqual(expectedCountryObj);
        expect(updatedSubmissionDetails.body.data['buyer-address-country']).toEqual(expectedCountryObj);
        expect(updatedSubmissionDetails.body.data['indemnifier-correspondence-address-country']).toEqual(expectedCountryObj);
        expect(updatedSubmissionDetails.body.data['indemnifier-address-country']).toEqual(expectedCountryObj);
        expect(updatedSubmissionDetails.body.data['supplier-address-country']).toEqual(expectedCountryObj);
        expect(updatedSubmissionDetails.body.data['supplier-correspondence-address-country']).toEqual(expectedCountryObj);
      });
    });

    describe('when supplyContractCurrency changes', () => {
      it('returns the updated submission-details with supplyContractCurrency as a currency object', async () => {
        const postResult = await as(testbank2Maker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          supplyContractCurrency: { id: CURRENCY.GBP },
        };

        const { body, status } = await as(testbank2Maker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);
        expect(status).toEqual(200);
        expect(body.data.supplyContractCurrency).toEqual({
          currencyId: 12,
          id: CURRENCY.GBP,
          text: 'GBP - UK Sterling',
        });

        const updateBody = {
          supplyContractCurrency: { id: 'CAD' },
        };

        const updatedSubmissionDetails = await as(testbank2Maker).put(updateBody).to(`/v1/deals/${createdDeal._id}/submission-details`);
        expect(updatedSubmissionDetails.status).toEqual(200);

        const expectedCurrencyObj = { currencyId: 5, id: 'CAD', text: 'CAD - Canadian Dollars' };

        expect(updatedSubmissionDetails.body.data.supplyContractCurrency).toEqual(expectedCurrencyObj);
      });
    });

    it('updates the deal', async () => {
      const postResult = await as(testbank2Maker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        supplierCompaniesHouseRegistrationNumber: '12345678',
        destinationOfGoodsAndServices: {},
        'buyer-address-country': {},
        'indemnifier-correspondence-address-country': {},
        'indemnifier-address-country': {},
        'supplier-address-country': {},
        'supplier-correspondence-address-country': {},
      };
      const expectedResponse = {
        ...submissionDetails,
        destinationOfGoodsAndServices: {},
        'buyer-address-country': {},
        'indemnifier-correspondence-address-country': {},
        'indemnifier-address-country': {},
        'supplier-address-country': {},
        'supplier-correspondence-address-country': {},
        status: 'Incomplete',
      };

      await as(testbank2Maker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      const { status, body } = await as(testbank2Maker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal.submissionDetails).toEqual(expectedResponse);
    });

    it('updates the deals updatedAt field', async () => {
      const postResult = await as(testbank2Maker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      const { body: dealInOriginalShape } = await as(testbank2Maker).get(`/v1/deals/${createdDeal._id}`);

      const submissionDetails = {
        supplierCompaniesHouseRegistrationNumber: '12345678',
      };

      await as(testbank2Maker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      const { status, body } = await as(testbank2Maker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      expect(body.deal.updatedAt).not.toEqual(dealInOriginalShape.deal.updatedAt);
    });

    it('updates deal.exporter.companyName with the provided `supplier-name` field', async () => {
      const postResult = await as(testbank2Maker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      await as(testbank2Maker).get(`/v1/deals/${createdDeal._id}`);

      const submissionDetails = {
        'supplier-name': 'Mock supplier name',
      };

      await as(testbank2Maker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      const { status, body } = await as(testbank2Maker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      expect(body.deal.exporter.companyName).toEqual(submissionDetails['supplier-name']);
    });
  });
});
