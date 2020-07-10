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

describe('/v1/deals/:id/loan', () => {
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
  });

  const mockCurrencies = [
    { id: 'GBP', text: 'GBP - UK Sterling' },
    { id: 'EUR', text: 'EUR - Euros' },
  ];

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

  const addLoanToDeal = async () => {
    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
    const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

    const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
    const { loanId } = createLoanResponse.body;
    return {
      dealId,
      loanId,
    };
  };

  const updateLoan = async (dealId, loanId, loanBody) => {
    const updatedLoan = await as(aBarclaysMaker).put(loanBody).to(`/v1/deals/${dealId}/loan/${loanId}`);
    return updatedLoan;
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
    await wipeDB.wipe(['currencies', 'deals']);
    await as(anEditor).postEach(mockCurrencies).to('/v1/currencies');
  });

  describe('GET /v1/deals/:id/loan/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/deals/123456789012/loan/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).get('/v1/deals/123456789012/loan/123456789012');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const deal = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/loan/123456789012`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/deals/123456789012/loan/123456789012');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown loan', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/loan/123456789012`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      const { loanId } = createLoanResponse.body;

      const { status } = await as(aSuperuser).get(`/v1/deals/${dealId}/loan/${loanId}`);

      expect(status).toEqual(200);
    });

    it('returns a loan with dealId, `Incomplete` status', async () => {
      const { dealId, loanId } = await addLoanToDeal();

      await updateLoan(dealId, loanId, {});

      const { status, body } = await as(aSuperuser).get(`/v1/deals/${dealId}/loan/${loanId}`);

      expect(status).toEqual(200);
      expect(body.loan._id).toEqual(loanId); // eslint-disable-line no-underscore-dangle
      expect(body.loan.status).toEqual('Incomplete');
      expect(body.dealId).toEqual(dealId);
    });

    describe('when a loan has all required fields', () => {
      it('retuns a loan with dealId and `Completed` status', async () => {
        const { dealId, loanId } = await addLoanToDeal();

        const loan = {
          facilityStage: 'Conditional',
          ukefGuaranteeInMonths: '12',
          facilityValue: '100',
          currencySameAsSupplyContractCurrency: 'true',
          interestMarginFee: '10',
          coveredPercentage: '40',
          premiumType: 'At maturity',
          dayCountBasis: '365',
        };

        await updateLoan(dealId, loanId, loan);
        const { status, body } = await as(aSuperuser).get(`/v1/deals/${dealId}/loan/${loanId}`);

        expect(status).toEqual(200);
        expect(body.loan._id).toEqual(loanId); // eslint-disable-line no-underscore-dangle
        expect(body.validationErrors.count).toEqual(0);
        expect(body.loan.status).toEqual('Completed');
        expect(body.dealId).toEqual(dealId);
      });
    });
  });

  describe('PUT /v1/deals/:id/loan/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle
      const { status } = await as().put({}).to(`/v1/deals/${dealId}/loan/12345678`);

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle
      const { status } = await as(noRoles).put({}).to(`/v1/deals/${dealId}/loan/12345678`);

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle
      const { status } = await as(anHSBCMaker).put({}).to(`/v1/deals/${dealId}/loan/12345678`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(aBarclaysMaker).put({}).to('/v1/deals/12345678/loan/12345678');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown loan', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/12345678`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      const { loanId } = createLoanResponse.body;

      const conditionalLoan = {
        facilityStage: 'Conditional',
        ukefGuaranteeInMonths: '12',
        facilityValue: '100',
        currencySameAsSupplyContractCurrency: 'true',
        interestMarginFee: '10',
        coveredPercentage: '40',
        premiumType: 'At maturity',
        dayCountBasis: '365',
      };

      const { status } = await as(aSuperuser).put(conditionalLoan).to(`/v1/deals/${dealId}/loan/${loanId}`);

      expect(status).toEqual(200);
    });

    it('should add guaranteeFeePayableByBank and ukefExposure values to the loan', async () => {
      const { dealId, loanId } = await addLoanToDeal();

      const loan = {
        facilityValue: '100',
        coveredPercentage: '40',
        interestMarginFee: '10',
      };

      const { body } = await updateLoan(dealId, loanId, loan);

      const expectedGuaranteeFee = calculateGuaranteeFee(loan.interestMarginFee);
      const expectedUkefExposure = calculateUkefExposure(loan.facilityValue, loan.coveredPercentage);

      expect(body.loan.guaranteeFeePayableByBank).toEqual(expectedGuaranteeFee);
      expect(body.loan.ukefExposure).toEqual(expectedUkefExposure);
    });

    describe('when req.body.facilityStage is `Unconditional`', () => {
      it('should remove `Conditional` related values from the loan', async () => {
        const { dealId, loanId } = await addLoanToDeal();

        const conditionalLoan = {
          facilityStage: 'Conditional',
          ukefGuaranteeInMonths: '12',
          facilityValue: '100',
          currencySameAsSupplyContractCurrency: 'true',
          interestMarginFee: '10',
          coveredPercentage: '40',
          premiumType: 'At maturity',
          dayCountBasis: '365',
        };

        await updateLoan(dealId, loanId, conditionalLoan);

        const updateToUnconditionalLoan = {
          ...conditionalLoan,
          facilityStage: 'Unconditional',
          bankReferenceNumber: '1234',
          ...requestedCoverStartDate(),
          ...coverEndDate(),
          disbursementAmount: '5',
        };

        const { status, body } = await updateLoan(dealId, loanId, updateToUnconditionalLoan);

        expect(status).toEqual(200);
        expect(body.ukefGuaranteeInMonths).toEqual(undefined);
      });
    });

    describe('when req.body.facilityStage is `Conditional`', () => {
      it('should remove `Unconditional` related values from the loan (but retain bankReferenceNumber)', async () => {
        const { dealId, loanId } = await addLoanToDeal();

        const unconditionalLoan = {
          facilityStage: 'Unconditional',
          bankReferenceNumber: '1234',
          facilityValue: '100',
          currencySameAsSupplyContractCurrency: 'true',
          interestMarginFee: '10',
          coveredPercentage: '40',
          ...requestedCoverStartDate(),
          ...coverEndDate(),
          disbursementAmount: '5',
          premiumType: 'At maturity',
          dayCountBasis: '365',
        };

        await updateLoan(dealId, loanId, unconditionalLoan);

        const updateToConditionalLoan = {
          ...unconditionalLoan,
          facilityStage: 'Conditional',
          ukefGuaranteeInMonths: '12',
        };

        const { status, body } = await updateLoan(dealId, loanId, updateToConditionalLoan);

        expect(status).toEqual(200);
        expect(body['requestedCoverStartDate-day']).toEqual(undefined);
        expect(body['requestedCoverStartDate-month']).toEqual(undefined);
        expect(body['requestedCoverStartDate-year']).toEqual(undefined);
        expect(body['coverEndDate-day']).toEqual(undefined);
        expect(body['coverEndDate-month']).toEqual(undefined);
        expect(body['coverEndDate-year']).toEqual(undefined);
        expect(body.disbursementAmount).toEqual(undefined);
      });
    });

    it('should add the deal\'s supplyContractCurrency to the loan\'s currency', async () => {
      const { dealId, loanId } = await addLoanToDeal();

      const loan = {
        facilityStage: 'Conditional',
        ukefGuaranteeInMonths: '12',
        facilityValue: '100',
        currencySameAsSupplyContractCurrency: 'true',
        interestMarginFee: '10',
        coveredPercentage: '40',
        premiumType: 'At maturity',
        dayCountBasis: '365',
      };

      const { status, body } = await updateLoan(dealId, loanId, loan);

      expect(status).toEqual(200);
      const expectedCurrency = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);
      expect(body.currency).toEqual({
        text: expectedCurrency.text,
        id: expectedCurrency.id,
      });
    });

    describe('when req.body.currencySameAsSupplyContractCurrency is changed from false to true', () => {
      it('should remove `currency is NOT the same` values from the loan and add the deal\'s supplyContractCurrency', async () => {
        const { dealId, loanId } = await addLoanToDeal();

        const loan = {
          facilityStage: 'Conditional',
          ukefGuaranteeInMonths: '12',
          facilityValue: '100',
          currencySameAsSupplyContractCurrency: 'false',
          interestMarginFee: '10',
          coveredPercentage: '40',
          currency: 'EUR',
          conversionRate: '100',
          'conversionRateDate-day': moment().format('DD'),
          'conversionRateDate-month': moment().format('MM'),
          'conversionRateDate-year': moment().format('YYYY'),
          premiumType: 'At maturity',
          dayCountBasis: '365',
        };

        await updateLoan(dealId, loanId, loan);

        const updatedLoan = {
          ...loan,
          currencySameAsSupplyContractCurrency: 'true',
        };

        const { status, body } = await updateLoan(dealId, loanId, updatedLoan);

        expect(status).toEqual(200);
        expect(body.conversionRate).toEqual(undefined);
        expect(body['conversionRateDate-day']).toEqual(undefined);
        expect(body['conversionRateDate-month']).toEqual(undefined);
        expect(body['conversionRateDate-year']).toEqual(undefined);

        const expectedCurrency = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);
        expect(body.currency).toEqual({
          text: expectedCurrency.text,
          id: expectedCurrency.id,
        });
      });
    });

    describe('when req.body.premiumType is changed to \'At maturity\'', () => {
      it('should remove premiumFrequency from the loan', async () => {
        const { dealId, loanId } = await addLoanToDeal();

        const loan = {
          premiumType: 'In advance',
          premiumFrequency: 'Quarterly',
        };

        await updateLoan(dealId, loanId, loan);

        const updatedLoan = {
          ...loan,
          premiumType: 'At maturity',
        };

        const { body } = await updateLoan(dealId, loanId, updatedLoan);

        expect(body.premiumFrequency).toEqual(undefined);
      });
    });
  });

  describe('PUT /v1/deals/:id/loan/create', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put().to('/v1/deals/123456789012/loan/create');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put().to('/v1/deals/123456789012/loan/create');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(anHSBCMaker).put().to(`/v1/deals/${dealId}/loan/create`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await as(aBarclaysMaker).put().to('/v1/deals/123456789012/loan/create');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aSuperuser).put({}).to(`/v1/deals/${dealId}/loan/create`);

      expect(status).toEqual(200);
    });

    it('creates incremental integer loan IDs', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      const { body } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);

      const loanIds = body.loanTransactions.items.map((loan) => loan._id);

      expect(loanIds[1] - loanIds[0]).toEqual(1);
      expect(loanIds[2] - loanIds[1]).toEqual(1);
    });

    it('adds an empty loan to a deal', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.loanTransactions.items.length).toEqual(1);
      expect(body.deal.loanTransactions.items[0]._id).toBeDefined(); // eslint-disable-line no-underscore-dangle
    });

    it('adds an empty loan to a deal whilst retaining existing loans', async () => {
      const mockLoan = { _id: '123456789012' };
      const newDealWithExistingLoans = {
        ...newDeal,
        loanTransactions: {
          items: [
            mockLoan,
          ],
        },
      };

      const deal = await as(aBarclaysMaker).post(newDealWithExistingLoans).to('/v1/deals/');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.loanTransactions.items.length).toEqual(2);
    });
  });
});
