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
    eligibility: {
      criteria: [
        { id: 15, answer: true },
      ],
    },
  });

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

  const createLoan = async () => {
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
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
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
      const { dealId, loanId } = await createLoan();

      await updateLoan(dealId, loanId, {});

      const { status, body } = await as(aSuperuser).get(`/v1/deals/${dealId}/loan/${loanId}`);

      expect(status).toEqual(200);
      expect(body.loan._id).toEqual(loanId); // eslint-disable-line no-underscore-dangle
      expect(body.loan.status).toEqual('Incomplete');
      expect(body.dealId).toEqual(dealId);
    });

    describe('when a loan has all required fields', () => {
      it('retuns a loan with dealId and `Completed` status', async () => {
        const { dealId, loanId } = await createLoan();

        const loan = {
          facilityStage: 'Unconditional',
          bankReferenceNumber: '1234',
          ...requestedCoverStartDate(),
          ...coverEndDate(),
          disbursementAmount: '5',
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
      const { dealId, loanId } = await createLoan();

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

    describe('when req.body contains requestedCoverStartDate-day, month and year', () => {
      it('should generate a timestamp', async () => {
        const { dealId, loanId } = await createLoan();

        const loan = {
          ...requestedCoverStartDate(),
        };

        const { body } = await updateLoan(dealId, loanId, loan);

        expect(body.loan.requestedCoverStartDate).toEqual(expect.any(String));
      });
    });

    describe('when req.body.facilityStage is `Unconditional`', () => {
      it('should remove `Conditional` related values from the loan', async () => {
        const { dealId, loanId } = await createLoan();

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
        expect(body.ukefGuaranteeInMonths).toEqual(null);
      });
    });

    describe('when req.body.facilityStage is `Conditional`', () => {
      it('should remove `Unconditional` related values from the loan (but retain bankReferenceNumber)', async () => {
        const { dealId, loanId } = await createLoan();

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
        expect(body.requestedCoverStartDate).toEqual(null);
        expect(body['requestedCoverStartDate-day']).toEqual(null);
        expect(body['requestedCoverStartDate-month']).toEqual(null);
        expect(body['requestedCoverStartDate-year']).toEqual(null);
        expect(body['coverEndDate-day']).toEqual(null);
        expect(body['coverEndDate-month']).toEqual(null);
        expect(body['coverEndDate-year']).toEqual(null);
        expect(body.disbursementAmount).toEqual(null);
      });
    });

    it('should add the deal\'s supplyContractCurrency to the loan\'s currency', async () => {
      const { dealId, loanId } = await createLoan();

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
        currencyId: expectedCurrency.currencyId,
        text: expectedCurrency.text,
        id: expectedCurrency.id,
      });
    });

    describe('when req.body.currencySameAsSupplyContractCurrency is changed from false to true', () => {
      it('should remove `currency is NOT the same` values from the loan and add the deal\'s supplyContractCurrency', async () => {
        const { dealId, loanId } = await createLoan();

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
        expect(body.conversionRate).toEqual(null);
        expect(body['conversionRateDate-day']).toEqual(null);
        expect(body['conversionRateDate-month']).toEqual(null);
        expect(body['conversionRateDate-year']).toEqual(null);

        const expectedCurrency = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);
        expect(body.currency).toEqual({
          currencyId: expectedCurrency.currencyId,
          text: expectedCurrency.text,
          id: expectedCurrency.id,
        });
      });
    });

    describe('when req.body.premiumType is changed to \'At maturity\'', () => {
      it('should remove premiumFrequency from the loan', async () => {
        const { dealId, loanId } = await createLoan();

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

    it('should generate requestedCoverStartDate timestamp', async () => {
      const { dealId, loanId } = await createLoan();

      const loan = {
        facilityStage: 'Unconditional',
        bankReferenceNumber: '1234',
        ...requestedCoverStartDate(),
        ...coverEndDate(),
        disbursementAmount: '5',
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
      expect(body.loan.requestedCoverStartDate).toEqual(expect.any(String));
      expect(body.loan['requestedCoverStartDate-day']).toEqual(loan['requestedCoverStartDate-day']);
      expect(body.loan['requestedCoverStartDate-month']).toEqual(loan['requestedCoverStartDate-month']);
      expect(body.loan['requestedCoverStartDate-year']).toEqual(loan['requestedCoverStartDate-year']);
    });

    it('should generate lastEdited timestamp', async () => {
      const { dealId, loanId } = await createLoan();

      const loan = {
        facilityStage: 'Unconditional',
        bankReferenceNumber: '1234',
      };

      await updateLoan(dealId, loanId, loan);
      const { status, body } = await as(aSuperuser).get(`/v1/deals/${dealId}/loan/${loanId}`);

      expect(status).toEqual(200);
      expect(body.loan.lastEdited).toEqual(expect.any(String));
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

    it('adds an empty loan to a deal, with facility createdDate, facilityType', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.loanTransactions.items.length).toEqual(1);
      expect(body.deal.loanTransactions.items[0]._id).toBeDefined(); // eslint-disable-line no-underscore-dangle
      expect(typeof body.deal.loanTransactions.items[0].createdDate).toEqual('string');
      expect(body.deal.loanTransactions.items[0].facilityType).toEqual('loan');
    });

    it('adds an empty loan to a deal', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      const newLoan = {
        facilityType: 'loan',
        associatedDealId: dealId,
      };

      await as(aBarclaysMaker).put(newLoan).to(`/v1/deals/${dealId}/loan/create`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.facilities.length).toEqual(1);
    });
  });

  describe('DELETE /v1/deals/:id/loan/:id', () => {
    let dealId;
    let loanId;

    beforeEach(async () => {
      const addLoanResponse = await createLoan();
      dealId = addLoanResponse.dealId;
      loanId = addLoanResponse.loanId;
    });

    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove(`/v1/deals/${dealId}/loan/12345678`);

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).remove(`/v1/deals/${dealId}/loan/12345678`);

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { status } = await as(anHSBCMaker).remove(`/v1/deals/${dealId}/loan/12345678`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(aBarclaysMaker).remove('/v1/deals/12345678/loan/12345678');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown loan', async () => {
      const { status } = await as(aBarclaysMaker).remove(`/v1/deals/${dealId}/loan/12345678`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { status } = await as(aBarclaysMaker).remove(`/v1/deals/${dealId}/loan/${loanId}`);
      expect(status).toEqual(200);
    });

    it('removes a loan from a deal', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);

      const { body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      const createdDeal = body.deal;
      expect(createdDeal.loanTransactions.items.length).toEqual(3);

      const loanIdToDelete = createdDeal.loanTransactions.items[1]._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aBarclaysMaker).remove(`/v1/deals/${dealId}/loan/${loanIdToDelete}`);
      expect(status).toEqual(200);

      const { body: updatedDealBody } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      const updatedLoans = updatedDealBody.deal.loanTransactions.items;
      expect(updatedLoans.length).toEqual(2);

      const deletedLoan = updatedLoans.filter((loan) => loan._id === loanIdToDelete);
      expect(deletedLoan.length).toEqual(0);
    });
  });
});
