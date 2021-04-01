const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

const newDeal = aDeal({
  details: {
    bankSupplyContractName: 'mock name',
    bankSupplyContractID: 'mock id',
    status: 'Draft',
    dateOfLastAction: '1985/11/04 21:00:00:000',
  },
  comments: [{
    username: 'bananaman',
    timestamp: '1984/12/25 00:00:00:001',
    text: 'Merry Christmas from the 80s',
  }, {
    username: 'supergran',
    timestamp: '1982/12/25 00:00:00:001',
    text: 'Also Merry Christmas from the 80s',
  }],
});

describe('/v1/deals/:id/submission-details', () => {
  let noRoles;
  let anHSBCMaker;
  let aBarclaysMaker;
  let aBarclaysChecker;
  let aSuperuser;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  describe('GET /v1/deals/:id/submission-details', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/deals/123456789012/submission-details');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await as(noRoles).get('/v1/deals/123456789012/submission-details');

      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=maker', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(anHSBCMaker).get(`/v1/deals/${body._id}/submission-details`);

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const { body } = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(aBarclaysChecker).get(`/v1/deals/${body._id}/submission-details`);

      expect(status).toEqual(200);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${body._id}/submission-details`);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/deals/123456789012/submission-details');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(aSuperuser).get(`/v1/deals/${body._id}/submission-details`);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${newId}/submission-details`);

      expect(status).toEqual(200);
      expect(body.data).toEqual({ status: 'Not started' });
    });
  });


  describe('PUT /v1/deals/:id/submission-details', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(newDeal).to('/v1/deals/123456789012/submission-details');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put(newDeal).to(
        '/v1/deals/123456789012/submission-details',
      );

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      const { status } = await as(aBarclaysMaker).put(statusUpdate).to(`/v1/deals/${body._id}/submission-details`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await as(anHSBCMaker).put(newDeal).to('/v1/deals/123456789012/submission-details');

      expect(status).toEqual(404);
    });

    it('returns the updated submission-details with country fields as objects', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
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

      const { status, body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      expect(status).toEqual(200);
      expect(body.data).toEqual(expectedResponse);
    });

    describe('when a country field changes', () => {
      it('returns the updated submission-details with country objects', async () => {
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          destinationOfGoodsAndServices: 'GBR',
          'buyer-address-country': 'GBR',
          'indemnifier-correspondence-address-country': 'GBR',
          'indemnifier-address-country': 'GBR',
          'supplier-address-country': 'GBR',
          'supplier-correspondence-address-country': 'GBR',
        };

        const { status } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);
        expect(status).toEqual(200);

        const body = {
          destinationOfGoodsAndServices: 'CAN',
          'buyer-address-country': 'CAN',
          'indemnifier-correspondence-address-country': 'CAN',
          'indemnifier-address-country': 'CAN',
          'supplier-address-country': 'CAN',
          'supplier-correspondence-address-country': 'CAN',
        };

        const updatedSubmissionDetails = await as(anHSBCMaker).put(body).to(`/v1/deals/${createdDeal._id}/submission-details`);
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
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          supplyContractCurrency: { id: 'GBP' },
        };

        const { body, status } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);
        expect(status).toEqual(200);
        expect(body.data.supplyContractCurrency).toEqual({
          currencyId: 12,
          id: 'GBP',
          text: 'GBP - UK Sterling',
        });

        const updateBody = {
          supplyContractCurrency: { id: 'CAD' },
        };

        const updatedSubmissionDetails = await as(anHSBCMaker).put(updateBody).to(`/v1/deals/${createdDeal._id}/submission-details`);
        expect(updatedSubmissionDetails.status).toEqual(200);

        const expectedCurrencyObj = { currencyId: 5, id: 'CAD', text: 'CAD - Canadian Dollars' };

        expect(updatedSubmissionDetails.body.data.supplyContractCurrency).toEqual(expectedCurrencyObj);
      });
    });

    it('updates the deal', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
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

      await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal.submissionDetails).toEqual(expectedResponse);
    });

    it('updates the deals details.dateOfLastAction field', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      const submissionDetails = {
        supplierCompaniesHouseRegistrationNumber: '12345678',
      };

      await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);

      expect(body.deal.details.dateOfLastAction).not.toEqual(createdDeal.details.dateOfLastAction);
    });
  });
});
