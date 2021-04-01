const moment = require('moment');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const {
  calculateGuaranteeFee,
  calculateUkefExposure,
} = require('../../../src/v1/section-calculations');
const { findOneCurrency } = require('../../../src/v1/controllers/currencies.controller');

describe('/v1/deals/:id/bond', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
    },
    submissionDetails: {
      supplyContractCurrency: {
        id: 'GBP',
      },
    },
    eligibility: {
      criteria: [
        { id: 15, answer: true },
      ],
    },
  });

  const allBondFields = {
    bondIssuer: 'issuer',
    bondType: 'bond type',
    facilityStage: 'unissued',
    ukefGuaranteeInMonths: '24',
    uniqueIdentificationNumber: '1234',
    bondBeneficiary: 'test',
    facilityValue: '123456.55',
    currencySameAsSupplyContractCurrency: 'true',
    riskMarginFee: '9.09',
    coveredPercentage: '2',
    feeType: 'test',
    feeFrequency: 'test',
    dayCountBasis: 'test',
  };

  const expectedGuaranteeFee = calculateGuaranteeFee(allBondFields.riskMarginFee);
  const expectedUkefExposure = calculateUkefExposure(allBondFields.facilityValue, allBondFields.coveredPercentage);

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

  const createBond = async () => {
    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
    const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

    const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
    const { bondId } = createBondResponse.body;
    return {
      dealId,
      bondId,
    };
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);

    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
    anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
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

    it('returns a bond with dealId, `Incomplete` status', async () => {
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
      it('returns a bond with dealId and `Completed` status and requestedCoverStartDate', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          ...requestedCoverStartDate(),
          ...coverEndDate(),
        };

        const createBondResponse = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const updateBondResponse = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(updateBondResponse.status).toEqual(200);

        const getBondResponse = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(getBondResponse.status).toEqual(200);

        expect(getBondResponse.body.bond._id).toEqual(bondId); // eslint-disable-line no-underscore-dangle
        expect(getBondResponse.body.dealId).toEqual(dealId);
        expect(getBondResponse.body.validationErrors.count).toEqual(0);
        expect(getBondResponse.body.bond.status).toEqual('Completed');
        expect(getBondResponse.body.bond.requestedCoverStartDate).toEqual(expect.any(String));
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

    it('adds an empty bond to a deal', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      expect(postResult.body.facilities.length).toEqual(0);

      const newBond = {
        facilityType: 'bond',
        associatedDealId: dealId,
      };

      await as(aBarclaysMaker).put(newBond).to(`/v1/deals/${dealId}/bond/create`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      expect(status).toEqual(200);

      const getDeal = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);
      expect(getDeal.body.deal.facilities.length).toEqual(1);
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
      const { bondId } = body;

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
          body: updatedDealBody,
        } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

        const updatedDeal = updatedDealBody.deal;

        expect(updatedDealStatus).toEqual(200);

        const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
          b._id === bondId); // eslint-disable-line no-underscore-dangle

        const expectedCurrency = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);

        const expectedUpdatedBond = {
          _id: bondId, // eslint-disable-line no-underscore-dangle
          associatedDealId: dealId,
          ...allBondFields,
          ...coverEndDate(),
          currency: {
            currencyId: expectedCurrency.currencyId,
            text: expectedCurrency.text,
            id: expectedCurrency.id,
          },
          guaranteeFeePayableByBank: expectedGuaranteeFee,
          ukefExposure: expectedUkefExposure,
          status: 'Completed',
          createdDate: expect.any(String),
          lastEdited: expect.any(String),
          facilityType: 'bond',
          requestedCoverStartDate: null,
          conversionRate: null,
          'conversionRateDate-day': null,
          'conversionRateDate-month': null,
          'conversionRateDate-year': null,
        };
        expect(updatedBond).toEqual(expectedUpdatedBond);
      });
    });

    describe('when a bond has req.body.facilityStage as `Issued`', () => {
      it('should remove `unissued` related values from the bond', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bondAsUnissued = {
          ...allBondFields,
          facilityStage: 'Unissued',
          ukefGuaranteeInMonths: '12',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status } = await as(aBarclaysMaker).put(bondAsUnissued).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(status).toEqual(200);

        const updatedBondAsIssued = {
          ...bondAsUnissued,
          facilityStage: 'Issued',
          bondIssuer: 'test',
          ...coverEndDate(),
          uniqueIdentificationNumber: '1234',
        };

        const { status: secondUpdateStatus } = await as(aBarclaysMaker).put(updatedBondAsIssued).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(secondUpdateStatus).toEqual(200);

        const {
          status: updatedDealStatus,
          body: updatedDealBody,
        } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);
        expect(updatedDealStatus).toEqual(200);

        const updatedDeal = updatedDealBody.deal;

        const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
          b._id === bondId); // eslint-disable-line no-underscore-dangle

        const expectedCurrency = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);

        const expectedBond = {
          _id: bondId, // eslint-disable-line no-underscore-dangle
          associatedDealId: dealId,
          ...updatedBondAsIssued,
          currency: {
            currencyId: expectedCurrency.currencyId,
            text: expectedCurrency.text,
            id: expectedCurrency.id,
          },
          guaranteeFeePayableByBank: expectedGuaranteeFee,
          ukefExposure: expectedUkefExposure,
          status: 'Completed',
          createdDate: expect.any(String),
          lastEdited: expect.any(String),
          facilityType: 'bond',
          requestedCoverStartDate: null,
          'requestedCoverStartDate-day': null,
          'requestedCoverStartDate-month': null,
          'requestedCoverStartDate-year': null,
          ukefGuaranteeInMonths: null,
          conversionRate: null,
          'conversionRateDate-day': null,
          'conversionRateDate-month': null,
          'conversionRateDate-year': null,
        };

        expect(updatedBond).toEqual(expectedBond);
      });
    });

    describe('when a bond has req.body.facilityStage as `Unissued`', () => {
      it('should remove `issued` related values from the bond', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bondAsIssued = {
          ...allBondFields,
          ...requestedCoverStartDate(),
          ...coverEndDate(),
          facilityStage: 'Issued',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status } = await as(aBarclaysMaker).put(bondAsIssued).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(status).toEqual(200);

        const updatedBondAsUnissued = {
          ...allBondFields,
          facilityStage: 'Unissued',
          bondIssuer: 'test',
          ukefGuaranteeInMonths: '12',
        };

        const { status: secondUpdateStatus } = await as(aBarclaysMaker).put(updatedBondAsUnissued).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(secondUpdateStatus).toEqual(200);

        const {
          status: updatedDealStatus,
          body: updatedDealBody,
        } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);
        expect(updatedDealStatus).toEqual(200);

        const updatedDeal = updatedDealBody.deal;

        const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
          b._id === bondId); // eslint-disable-line no-underscore-dangle

        const expectedCurrency = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);

        const expectedBond = {
          _id: bondId, // eslint-disable-line no-underscore-dangle
          associatedDealId: dealId,
          ...updatedBondAsUnissued,
          currency: {
            currencyId: expectedCurrency.currencyId,
            text: expectedCurrency.text,
            id: expectedCurrency.id,
          },
          guaranteeFeePayableByBank: expectedGuaranteeFee,
          ukefExposure: expectedUkefExposure,
          status: 'Completed',
          createdDate: expect.any(String),
          lastEdited: expect.any(String),
          facilityType: 'bond',
          requestedCoverStartDate: null,
          'requestedCoverStartDate-day': null,
          'requestedCoverStartDate-month': null,
          'requestedCoverStartDate-year': null,
          'coverEndDate-day': null,
          'coverEndDate-month': null,
          'coverEndDate-year': null,
          uniqueIdentificationNumber: null,
          conversionRate: null,
          'conversionRateDate-day': null,
          'conversionRateDate-month': null,
          'conversionRateDate-year': null,
        };
        expect(updatedBond).toEqual(expectedBond);
      });
    });

    it('should add the deal\'s supplyContractCurrency to the bond\'s currency', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      const bondBody = {
        ...allBondFields,
        currencySameAsSupplyContractCurrency: 'true',
      };

      const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

      const { body: createBondBody } = createBondResponse;
      const { bondId } = createBondBody;

      const { status } = await as(aBarclaysMaker).put(bondBody).to(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(200);

      const { body: updatedDeal } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      expect(status).toEqual(200);

      const updatedBond = updatedDeal.deal.bondTransactions.items.find((b) =>
        b._id === bondId); // eslint-disable-line no-underscore-dangle

      const expectedCurrency = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);

      expect(updatedBond).toEqual({
        _id: bondId, // eslint-disable-line no-underscore-dangle
        associatedDealId: dealId,
        ...bondBody,
        currency: {
          currencyId: expectedCurrency.currencyId,
          text: expectedCurrency.text,
          id: expectedCurrency.id,
        },
        guaranteeFeePayableByBank: expectedGuaranteeFee,
        ukefExposure: expectedUkefExposure,
        status: 'Completed',
        createdDate: expect.any(String),
        lastEdited: expect.any(String),
        facilityType: 'bond',
        requestedCoverStartDate: null,
        conversionRate: null,
        'conversionRateDate-day': null,
        'conversionRateDate-month': null,
        'conversionRateDate-year': null,
      });
    });

    describe('when a bond has req.body.currencySameAsSupplyContractCurrency changed from false to true', () => {
      it('should remove `currency is NOT the same` values from the bond and add the deal\'s supplyContractCurrency', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bondBody = {
          ...allBondFields,
          facilityValue: '123',
          currencySameAsSupplyContractCurrency: 'false',
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
          facilityValue: '456',
          currencySameAsSupplyContractCurrency: 'true',
        };

        const { status: secondUpdateStatus } = await as(aBarclaysMaker).put(bondWithSameCurrencyAsContract).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(secondUpdateStatus).toEqual(200);

        const { body: updatedDealBody } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);
        const updatedDeal = updatedDealBody.deal;

        expect(status).toEqual(200);

        const updatedBond = updatedDeal.bondTransactions.items.find((b) =>
          b._id === bondId); // eslint-disable-line no-underscore-dangle

        expect(updatedBond._id).toEqual(bondId); // eslint-disable-line no-underscore-dangle
        expect(updatedBond.facilityValue).toEqual(bondWithSameCurrencyAsContract.facilityValue);
        expect(updatedBond.currencySameAsSupplyContractCurrency).toEqual(bondWithSameCurrencyAsContract.currencySameAsSupplyContractCurrency);
        expect(updatedBond.conversionRate).toEqual(null);
        expect(updatedBond['conversionRateDate-day']).toEqual(null);
        expect(updatedBond['conversionRateDate-month']).toEqual(null);
        expect(updatedBond['conversionRateDate-year']).toEqual(null);

        const expectedCurrency = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);
        expect(updatedBond.currency).toEqual({
          currencyId: expectedCurrency.currencyId,
          text: expectedCurrency.text,
          id: expectedCurrency.id,
        });
      });
    });

    describe('when req.body.feeType is changed to \'At maturity\'', () => {
      it('should remove feeFrequency', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;


        const bond = {
          feeType: 'In advance',
          feeFrequency: 'Quarterly',
        };

        await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        const updatedBond = {
          ...bond,
          feeType: 'At maturity',
        };

        const { body } = await as(aBarclaysMaker).put(updatedBond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(body.feeFrequency).toEqual(undefined);
      });
    });

    it('should generate requestedCoverStartDate timestamp', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

      const { body: createBondBody } = createBondResponse;
      const { bondId } = createBondBody;

      const bond = {
        ...allBondFields,
        ...requestedCoverStartDate(),
        ...coverEndDate(),
      };

      const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(200);
      expect(body.requestedCoverStartDate).toEqual(expect.any(String));
      expect(body['requestedCoverStartDate-day']).toEqual(bond['requestedCoverStartDate-day']);
      expect(body['requestedCoverStartDate-month']).toEqual(bond['requestedCoverStartDate-month']);
      expect(body['requestedCoverStartDate-year']).toEqual(bond['requestedCoverStartDate-year']);
    });

    it('should generate lastEdited timestamp', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

      const { body: createBondBody } = createBondResponse;
      const { bondId } = createBondBody;

      const bond = allBondFields;

      const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(200);
      expect(body.lastEdited).toEqual(expect.any(String));
    });
  });

  describe('DELETE /v1/deals/:id/bond/:id', () => {
    let dealId;
    let bondId;

    beforeEach(async () => {
      const addBondResponse = await createBond();
      dealId = addBondResponse.dealId;
      bondId = addBondResponse.bondId;
    });

    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove(`/v1/deals/${dealId}/bond/12345678`);

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).remove(`/v1/deals/${dealId}/bond/12345678`);

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { status } = await as(anHSBCMaker).remove(`/v1/deals/${dealId}/bond/12345678`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(aBarclaysMaker).remove('/v1/deals/12345678/bond/12345678');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown bond', async () => {
      const { status } = await as(aBarclaysMaker).remove(`/v1/deals/${dealId}/bond/12345678`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { status } = await as(aBarclaysMaker).remove(`/v1/deals/${dealId}/bond/${bondId}`);
      expect(status).toEqual(200);
    });

    it('removes a bond from a deal', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

      const { body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      const createdDeal = body.deal;
      expect(createdDeal.facilities.length).toEqual(3);

      const bondIdToDelete = createdDeal.facilities[0];

      const { status } = await as(aBarclaysMaker).remove(`/v1/deals/${dealId}/bond/${bondIdToDelete}`);
      expect(status).toEqual(200);

      const getBondAfterDelete = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/bond/${bondIdToDelete}`);
      expect(getBondAfterDelete.status).toEqual(404);

      const dealAfterDeletingBond = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      expect(dealAfterDeletingBond.body.deal.facilities.length).toEqual(2);
    });
  });
});
