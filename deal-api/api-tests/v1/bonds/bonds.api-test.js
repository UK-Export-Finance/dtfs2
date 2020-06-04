const moment = require('moment');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

describe('/v1/deals/:id/bond', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
    },
  });

  const mockCurrencies = [
    { id: 'GBP', text: 'GBP - UK Sterling' },
    { id: 'EUR', text: 'EUR - Euros' },
  ];

  const allBondFields = {
    bondIssuer: 'issuer',
    bondType: 'bond type',
    bondStage: 'unissued',
    ukefGuaranteeInMonths: '24',
    uniqueIdentificationNumber: '1234',
    bondBeneficiary: 'test',
    bondValue: '123',
    transactionCurrencySameAsSupplyContractCurrency: 'true',
    riskMarginFee: '1',
    coveredPercentage: '2',
    feeType: 'test',
    feeFrequency: 'test',
    dayCountBasis: 'test',
  };

  const nowDate = moment();
  const requestedCoverStartDate = () => {
    const date = nowDate;

    return {
      'requestedCoverStartDate-day': moment(date).format('DD'),
      'requestedCoverStartDate-month': moment(date).format('MM'),
      'requestedCoverStartDate-year': moment(date).format('YYYY'),
    };
  };

  const coverEndDate = () => {
    const date = moment(nowDate).add(1, 'months');

    return {
      'coverEndDate-day': moment(date).format('DD'),
      'coverEndDate-month': moment(date).format('MM'),
      'coverEndDate-year': moment(date).format('YYYY'),
    };
  };

  let noRoles;
  let aBarclaysMaker;
  let anHSBCMaker;
  let aSuperuser;
  let anEditor;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);

    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
    anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['bondCurrencies', 'deals']);

    await as(anEditor).postEach(mockCurrencies).to('/v1/bond-currencies');
  });

  describe('GET /v1/deals/:id/bond/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/deals/123456789012/bond/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).get('/v1/deals/123456789012/bond/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/bond/123456789012`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/deals/123456789012/bond/123456789012');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown bond', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/bond/123456789012`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      const { bondId } = createBondResponse.body;

      const { status } = await as(aSuperuser).get(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(200);
    });

    it('returns a bond with dealId, `Incomplete` status and validationErrors', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      const { bondId } = createBondResponse.body;

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(200);
      expect(body.bond._id).toEqual(bondId); // eslint-disable-line no-underscore-dangle
      expect(body.bond.status).toEqual('Incomplete');
      expect(body.dealId).toEqual(dealId);
    });

    describe('when a bond has all required fields', () => {
      it('returns a bond with dealId and `Completed` status', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          ...coverEndDate(),
        };

        const createBondResponse = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/create`);


        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const udpateBondResponse = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(udpateBondResponse.status).toEqual(200);

        const getBondResponse = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(getBondResponse.status).toEqual(200);

        expect(getBondResponse.body.bond._id).toEqual(bondId); // eslint-disable-line no-underscore-dangle
        expect(getBondResponse.body.dealId).toEqual(dealId);
        expect(getBondResponse.body.validationErrors.count).toEqual(0);
        expect(getBondResponse.body.bond.status).toEqual('Completed');
      });
    });
  });

  describe('PUT /v1/deals/:id/bond/create', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put().to('/v1/deals/123456789012/bond/create');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put().to('/v1/deals/123456789012/bond/create');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(anHSBCMaker).put().to(`/v1/deals/${dealId}/bond/create`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await as(aBarclaysMaker).put().to('/v1/deals/123456789012/bond/create');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aSuperuser).put({}).to(`/v1/deals/${dealId}/bond/create`);

      expect(status).toEqual(200);
    });

    it('creates incremental integer bond IDs', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      const { body } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

      const bondIds = body.bondTransactions.items.map((bond) => bond._id);

      expect(bondIds[1] - bondIds[0]).toEqual(1);
      expect(bondIds[2] - bondIds[1]).toEqual(1);
    });

    it('adds an empty bond to a deal', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

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

      const postResult = await as(aBarclaysMaker).post(newDealWithExistingBonds).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.bondTransactions.items.length).toEqual(2);
    });
  });

  describe('PUT /v1/deals/:id/bond/:bondId', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put().to('/v1/deals/123456789012/bond/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put().to('/v1/deals/123456789012/bond/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(anHSBCMaker).put().to(`/v1/deals/${dealId}/bond/123456789012`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(aBarclaysMaker).put({}).to('/v1/deals/123456789012/bond/123456789012');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown bond', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/123456789012`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const { body } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      const bondId = body.bondTransactions.items[0]._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aSuperuser).put(allBondFields).to(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(200);
    });

    describe('with all required fields in body', () => {
      it('updates an existing bond and adds currency, status, guaranteeFeePayableByBank and ukefExposure values', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const bond = {
          ...allBondFields,
          ...coverEndDate(),
        };

        const { status } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(200);

        const {
          status: updatedDealStatus,
          body: updatedDeal,
        } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

        expect(updatedDealStatus).toEqual(200);

        const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
          b._id === bondId); // eslint-disable-line no-underscore-dangle

        const expectedUpdatedBond = {
          _id: bondId, // eslint-disable-line no-underscore-dangle
          ...allBondFields,
          ...coverEndDate(),
          currency: deal.body.supplyContractCurrency,
          guaranteeFeePayableByBank: allBondFields.riskMarginFee * 0.9,
          ukefExposure: allBondFields.bondValue * allBondFields.coveredPercentage,
          status: 'Completed',
        };
        expect(updatedBond).toEqual(expectedUpdatedBond);
      });
    });

    describe('when a bond has req.body.bondStage as `Issued`', () => {
      it('should remove `unissued` related values from the bond', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bondAsUnissued = {
          ...allBondFields,
          bondStage: 'Unissued',
          ukefGuaranteeInMonths: '12',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status } = await as(aBarclaysMaker).put(bondAsUnissued).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(status).toEqual(200);

        const updatedBondAsIssued = {
          ...bondAsUnissued,
          bondStage: 'Issued',
          bondIssuer: 'test',
          ...coverEndDate(),
          uniqueIdentificationNumber: '1234',
        };

        const { status: secondUpdateStatus } = await as(aBarclaysMaker).put(updatedBondAsIssued).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(secondUpdateStatus).toEqual(200);

        const {
          status: updatedDealStatus,
          body: updatedDeal,
        } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);
        expect(updatedDealStatus).toEqual(200);

        const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
          b._id === bondId); // eslint-disable-line no-underscore-dangle

        const expectedBond = {
          _id: bondId, // eslint-disable-line no-underscore-dangle
          ...updatedBondAsIssued,
          currency: deal.body.supplyContractCurrency,
          guaranteeFeePayableByBank: allBondFields.riskMarginFee * 0.9,
          ukefExposure: allBondFields.bondValue * allBondFields.coveredPercentage,
          status: 'Completed',
        };
        delete expectedBond.ukefGuaranteeInMonths;

        expect(updatedBond).toEqual(expectedBond);
      });
    });

    describe('when a bond has req.body.bondStage as `Unissued`', () => {
      it('should remove `issued` related values from the bond', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bondAsIssued = {
          ...allBondFields,
          ...requestedCoverStartDate(),
          ...coverEndDate(),
          bondStage: 'Issued',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status } = await as(aBarclaysMaker).put(bondAsIssued).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(status).toEqual(200);

        const updatedBondAsUnissued = {
          ...allBondFields,
          bondStage: 'Unissued',
          bondIssuer: 'test',
          ukefGuaranteeInMonths: '12',
        };

        const { status: secondUpdateStatus } = await as(aBarclaysMaker).put(updatedBondAsUnissued).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(secondUpdateStatus).toEqual(200);

        const {
          status: updatedDealStatus,
          body: updatedDeal,
        } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);
        expect(updatedDealStatus).toEqual(200);

        const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
          b._id === bondId); // eslint-disable-line no-underscore-dangle

        const expectedBond = {
          _id: bondId, // eslint-disable-line no-underscore-dangle
          ...updatedBondAsUnissued,
          currency: deal.body.supplyContractCurrency,
          guaranteeFeePayableByBank: allBondFields.riskMarginFee * 0.9,
          ukefExposure: allBondFields.bondValue * allBondFields.coveredPercentage,
          status: 'Completed',
        };
        delete expectedBond['requestedCoverStartDate-day'];
        delete expectedBond['requestedCoverStartDate-month'];
        delete expectedBond['requestedCoverStartDate-year'];
        delete expectedBond['coverEndDate-day'];
        delete expectedBond['coverEndDate-month'];
        delete expectedBond['coverEndDate-year'];
        delete expectedBond.uniqueIdentificationNumber;

        expect(updatedBond).toEqual(expectedBond);
      });
    });

    describe('when a bond has req.body.transactionCurrencySameAsSupplyContractCurrency changed from false to true', () => {
      it('should remove `currency is NOT the same` values from the bond', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bondBody = {
          ...allBondFields,
          bondValue: '123',
          transactionCurrencySameAsSupplyContractCurrency: 'false',
          currency: 'EUR',
          conversionRate: '100',
          'conversionRateDate-day': moment().format('DD'),
          'conversionRateDate-month': moment().format('MM'),
          'conversionRateDate-year': moment().format('YYYY'),
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status } = await as(aBarclaysMaker).put(bondBody).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(status).toEqual(200);

        const bondWithSameCurrencyAsContract = {
          bondValue: '456',
          transactionCurrencySameAsSupplyContractCurrency: 'true',
        };

        const { status: secondUpdateStatus } = await as(aBarclaysMaker).put(bondWithSameCurrencyAsContract).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(secondUpdateStatus).toEqual(200);

        const { body: updatedDeal } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

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

      it('should add the deal\'s supplyContractCurrency to the bond\'s currency', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bondBody = {
          ...allBondFields,
          transactionCurrencySameAsSupplyContractCurrency: 'true',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status } = await as(aBarclaysMaker).put(bondBody).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(200);

        const { body: updatedDeal } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

        expect(status).toEqual(200);

        const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
          b._id === bondId); // eslint-disable-line no-underscore-dangle

        expect(updatedBond).toEqual({
          _id: bondId, // eslint-disable-line no-underscore-dangle
          ...bondBody,
          currency: deal.body.supplyContractCurrency,
          guaranteeFeePayableByBank: allBondFields.riskMarginFee * 0.9,
          ukefExposure: allBondFields.bondValue * allBondFields.coveredPercentage,
          status: 'Completed',
        });
      });
    });
  });
});
