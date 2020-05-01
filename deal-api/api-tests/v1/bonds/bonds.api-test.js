const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { get, post, put } = require('../../api')(app);

describe('/v1/deals/:id/bond', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
    },
  });

  let noRoles;
  let aBarclaysMaker;
  let anHSBCMaker;
  let aSuperuser;
  let anEditor;

  beforeEach(async () => {
    await wipeDB.wipe(['bondCurrencies', 'deals']);

    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
    anEditor = testUsers().withRole('editor').one();

    const mockCurrencies = [
      { id: 'GBP', text: 'GBP - UK Sterling' },
      { id: 'EUR', text: 'EUR - Euros' },
    ];

    await post(mockCurrencies[0], anEditor.token).to('/v1/bond-currencies');
    await post(mockCurrencies[1], anEditor.token).to('/v1/bond-currencies');
  });

  describe('GET /v1/deals/:id/bond/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await get('/v1/deals/123456789012/bond/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await get('/v1/deals/123456789012/bond/123456789012', aUserWithoutRoles);

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await get(`/v1/deals/${dealId}/bond/123456789012`, user2);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await get('/v1/deals/123456789012/bond/123456789012', user1);

      expect(status).toEqual(404);
    });

    it('404s requests for unknown bond', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await get(`/v1/deals/${dealId}/bond/123456789012`, user1);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const createBondResponse = await put({}, user1).to(`/v1/deals/${dealId}/bond/create`);
      const { bondId } = createBondResponse.body;

      const { status } = await get(`/v1/deals/${dealId}/bond/${bondId}`, superuser);

      expect(status).toEqual(200);
    });

    it('returns a bond with dealId and validationErrors', async () => {
      const postResult = await post(newDeal, user1).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const createBondResponse = await put({}, user1).to(`/v1/deals/${dealId}/bond/create`);
      const { bondId } = createBondResponse.body;

      const { status, body } = await get(`/v1/deals/${dealId}/bond/${bondId}`, user1);

      expect(status).toEqual(200);
      expect(body.bond._id).toEqual(bondId); // eslint-disable-line no-underscore-dangle
      expect(body.dealId).toEqual(dealId);
      expect(body.validationErrors.count).toEqual(9);
      expect(body.validationErrors.errorList.bondType).toBeDefined();
      expect(body.validationErrors.errorList.bondStage).toBeDefined();
      expect(body.validationErrors.errorList.bondValue).toBeDefined();
      expect(body.validationErrors.errorList.transactionCurrencySameAsSupplyContractCurrency).toBeDefined();
      expect(body.validationErrors.errorList.riskMarginFee).toBeDefined();
      expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
      expect(body.validationErrors.errorList.feeType).toBeDefined();
      expect(body.validationErrors.errorList.feeFrequency).toBeDefined();
      expect(body.validationErrors.errorList.dayCountBasis).toBeDefined();
    });
  });

  describe('PUT /v1/deals/:id/bond/create', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await put().to('/v1/deals/123456789012/bond/create');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await put(noRoles.token).to('/v1/deals/123456789012/bond/create');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const postResult = await post(newDeal, aBarclaysMaker.token).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await put(anHSBCMaker.token).to(`/v1/deals/${dealId}/bond/create`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await put({}, aBarclaysMaker.token).to('/v1/deals/123456789012/bond/create');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await post(newDeal, aBarclaysMaker.token).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await put({}, aSuperuser.token).to(`/v1/deals/${dealId}/bond/create`);

      expect(status).toEqual(200);
    });

    it('adds an empty bond to a deal', async () => {
      const postResult = await post(newDeal, aBarclaysMaker.token).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      await put({}, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/create`);

      const { status, body } = await get(
        `/v1/deals/${dealId}`,
        aBarclaysMaker.token,
      );
      expect(status).toEqual(200);
      expect(body.bondTransactions.items.length).toEqual(1);
      expect(body.bondTransactions.items[0]._id).toBeDefined(); // eslint-disable-line no-underscore-dangle
    });

    it('adds an empty bond to a deal whilst retaining existing bonds', async () => {
      const mockBond = { _id: '123456789012' };
      const newDealWithExistingBonds = {
        ...newDeal,
        bondTransactions: {
          items: [
            mockBond,
          ],
        },
      };

      const postResult = await post(newDealWithExistingBonds, aBarclaysMaker.token).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      await put({}, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/create`);

      const { status, body } = await get(
        `/v1/deals/${dealId}`,
        aBarclaysMaker.token,
      );
      expect(status).toEqual(200);
      expect(body.bondTransactions.items.length).toEqual(2);

      const existingBond = body.bondTransactions.items.find((b) =>
        b._id === mockBond._id); // eslint-disable-line no-underscore-dangle
      expect(Object.keys(existingBond).length).toEqual(1);
    });
  });

  describe('PUT /v1/deals/:id/bond/:bondId', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await put().to('/v1/deals/123456789012/bond/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await put(noRoles.token).to('/v1/deals/123456789012/bond/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const postResult = await post(newDeal, aBarclaysMaker.token).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await put(anHSBCMaker.token).to(`/v1/deals/${dealId}/bond/123456789012`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await put({}, aBarclaysMaker.token).to('/v1/deals/123456789012/bond/123456789012');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown bond', async () => {
      const postResult = await post(newDeal, aBarclaysMaker.token).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await put({}, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/123456789012`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await post(newDeal, aBarclaysMaker.token).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { body } = await put({}, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/create`);
      const bondId = body.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle

      const { status } = await put({}, aSuperuser.token).to(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(200);
    });

    it('updates an existing bond', async () => {
      const deal = await post(newDeal, aBarclaysMaker.token).to('/v1/deals/');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      // TODO: add all possible values here
      const bondBody = {
        bondIssuer: 'issuer',
        bondType: 'bond type',
        bondStage: 'unissued',
        ukefGuaranteeInMonths: '24',
        'requestedCoverStartDate-day': '01',
        'requestedCoverStartDate-month': '02',
        'requestedCoverStartDate-year': '2020',
        'coverEndDate-day': '01',
        'coverEndDate-month': '02',
        'coverEndDate-year': '2022',
        uniqueIdentificationNumber: '1234',
        bondBeneficiary: 'test',
        currency: 'EUR',
        status: 'Incomplete',
      };

      const createBondResponse = await put({}, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/create`);

      const { body: createBondBody } = createBondResponse;
      const { bondId } = createBondBody;

      const { status } = await put(bondBody, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(200);

      const { body: updatedDeal } = await get(
        `/v1/deals/${dealId}`,
        aBarclaysMaker.token,
      );

      expect(status).toEqual(200);

      const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
        b._id === bondId); // eslint-disable-line no-underscore-dangle

      const { body: getCurrencyBody } = await get(
        `/v1/bond-currencies/${bondBody.currency}`,
        aBarclaysMaker.token,
      );

      const expectedCurrencyObj = {
        id: getCurrencyBody.id,
        text: getCurrencyBody.text,
      };

      const expectedUpdatedBond = {
        _id: bondId, // eslint-disable-line no-underscore-dangle
        ...bondBody,
        currency: expectedCurrencyObj,
      };
      expect(updatedBond).toEqual(expectedUpdatedBond);
    });

    describe('when a bond has req.body.bondStage as `Issued`', () => {
      it('should remove `unissued` related values from the bond', async () => {
        const deal = await post(newDeal, aBarclaysMaker.token).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bondAsUnissued = {
          bondStage: 'Unissued',
          bondIssuer: 'test',
          ukefGuaranteeInMonths: '12',
        };

        const createBondResponse = await put({}, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status } = await put(bondAsUnissued, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(status).toEqual(200);

        const updatedBondAsIssued = {
          bondStage: 'Issued',
          bondIssuer: 'test',
          'requestedCoverStartDate-day': '01',
          'requestedCoverStartDate-month': '02',
          'requestedCoverStartDate-year': '2020',
          'coverEndDate-day': '01',
          'coverEndDate-month': '02',
          'coverEndDate-year': '2022',
          uniqueIdentificationNumber: '1234',
        };

        const { status: secondUpdateStatus } = await put(updatedBondAsIssued, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(secondUpdateStatus).toEqual(200);

        const { body: updatedDeal } = await get(
          `/v1/deals/${dealId}`,
          aBarclaysMaker.token,
        );
        expect(status).toEqual(200);

        const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
          b._id === bondId); // eslint-disable-line no-underscore-dangle

        const expectedBond = {
          _id: bondId, // eslint-disable-line no-underscore-dangle
          ...updatedBondAsIssued,
          status: 'Incomplete',
        };

        expect(updatedBond).toEqual(expectedBond);
      });
    });

    describe('when a bond has req.body.bondStage as `Unissued`', () => {
      it('should remove `unissued` related values from the bond', async () => {
        const deal = await post(newDeal, aBarclaysMaker.token).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bondAsIssued = {
          bondStage: 'Issued',
          bondIssuer: 'test',
          'requestedCoverStartDate-day': '01',
          'requestedCoverStartDate-month': '02',
          'requestedCoverStartDate-year': '2020',
          'coverEndDate-day': '01',
          'coverEndDate-month': '02',
          'coverEndDate-year': '2022',
          uniqueIdentificationNumber: '1234',
        };

        const createBondResponse = await put({}, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status } = await put(bondAsIssued, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(status).toEqual(200);

        const updatedBondAsUnissued = {
          bondStage: 'Unissued',
          bondIssuer: 'test',
          ukefGuaranteeInMonths: '12',
        };

        const { status: secondUpdateStatus } = await put(updatedBondAsUnissued, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(secondUpdateStatus).toEqual(200);

        const { body: updatedDeal } = await get(
          `/v1/deals/${dealId}`,
          aBarclaysMaker.token,
        );
        expect(status).toEqual(200);

        const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
          b._id === bondId); // eslint-disable-line no-underscore-dangle

        const expectedBond = {
          _id: bondId, // eslint-disable-line no-underscore-dangle
          ...updatedBondAsUnissued,
          status: 'Incomplete',
        };

        expect(updatedBond).toEqual(expectedBond);
      });
    });

    describe('when a bond has req.body.transactionCurrencySameAsSupplyContractCurrency', () => {
      it('should remove `currency is NOT the same` values from the bond', async () => {
        const deal = await post(newDeal, aBarclaysMaker.token).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bondBody = {
          transactionCurrencySameAsSupplyContractCurrency: 'false',
          bondValue: '123',
          conversionRate: '100',
          'conversionRateDate-day': '14',
          'conversionRateDate-month': '12',
          'conversionRateDate-year': '2019',
        };

        const createBondResponse = await put({}, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status } = await put(bondBody, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(status).toEqual(200);


        const bondWithSameCurrencyAsContract = {
          bondValue: '456',
          transactionCurrencySameAsSupplyContractCurrency: 'true',
        };

        const { status: secondUpdateStatus } = await put(bondWithSameCurrencyAsContract, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(secondUpdateStatus).toEqual(200);

        const { body: updatedDeal } = await get(
          `/v1/deals/${dealId}`,
          aBarclaysMaker.token,
        );

        expect(status).toEqual(200);

        const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
          b._id === bondId); // eslint-disable-line no-underscore-dangle

        expect(updatedBond._id).toEqual(bondId); // eslint-disable-line no-underscore-dangle
        expect(updatedBond.bondValue).toEqual(bondWithSameCurrencyAsContract.bondValue);
        expect(updatedBond.transactionCurrencySameAsSupplyContractCurrency).toEqual(bondWithSameCurrencyAsContract.transactionCurrencySameAsSupplyContractCurrency);
        expect(updatedBond.conversionRate).toEqual(undefined);
        expect(updatedBond['conversionRateDate-day']).toEqual(undefined);
        expect(updatedBond['conversionRateDate-month']).toEqual(undefined);
        expect(updatedBond['conversionRateDate-year']).toEqual(undefined);
      });

      it('should use the deal\'s supplyContractCurrency to the bond\'s currency', async () => {
        const deal = await post(newDeal, aBarclaysMaker.token).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bondBody = {
          transactionCurrencySameAsSupplyContractCurrency: 'true',
        };

        const createBondResponse = await put({}, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status } = await put(bondBody, aBarclaysMaker.token).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(200);

        const { body: updatedDeal } = await get(
          `/v1/deals/${dealId}`,
          aBarclaysMaker.token,
        );

        expect(status).toEqual(200);

        const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
          b._id === bondId); // eslint-disable-line no-underscore-dangle

        expect(updatedBond).toEqual({
          _id: bondId, // eslint-disable-line no-underscore-dangle
          ...bondBody,
          currency: deal.body.supplyContractCurrency,
          status: 'Incomplete',
        });
      });
    });
  });
});
