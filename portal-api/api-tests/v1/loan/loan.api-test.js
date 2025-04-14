const { format, add } = require('date-fns');
const { CURRENCY } = require('@ukef/dtfs2-common');
const databaseHelper = require('../../database-helper');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');
const testUserCache = require('../../api-test-users');
const { as, get } = require('../../api')(app);
const { calculateGuaranteeFee, calculateUkefExposure } = require('../../../src/v1/section-calculations');
const { findOneCurrency } = require('../../../src/v1/controllers/currencies.controller');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

describe('/v1/deals/:id/loan', () => {
  const newDeal = aDeal({
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    submissionDetails: {
      supplyContractCurrency: {
        id: CURRENCY.GBP,
      },
    },
    eligibility: {
      criteria: [{ id: 15, answer: true }],
    },
  });

  const nowDate = new Date();
  const requestedCoverStartDate = () => ({
    'requestedCoverStartDate-day': format(nowDate, 'dd'),
    'requestedCoverStartDate-month': format(nowDate, 'MM'),
    'requestedCoverStartDate-year': format(nowDate, 'yyyy'),
  });

  const coverEndDate = () => {
    const date = add(nowDate, { months: 1 });

    return {
      'coverEndDate-day': format(date, 'dd'),
      'coverEndDate-month': format(date, 'MM'),
      'coverEndDate-year': format(date, 'yyyy'),
    };
  };

  let testUsers;
  let aBarclaysMaker;
  let anHSBCMaker;
  let aSuperuser;

  const createLoan = async () => {
    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');

    const dealId = deal.body._id;

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
    testUsers = await testUserCache.initialise(app);

    aBarclaysMaker = testUsers().withRole(MAKER).withBankName('Bank 1').one();
    anHSBCMaker = testUsers().withRole(MAKER).withBankName('Bank 2').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);
  });

  describe('GET /v1/deals/:id/loan/:id', () => {
    let dealId;
    let loanId;
    let aLoanUrl;

    beforeEach(async () => {
      const { dealId: createdDealId, loanId: createdLoanId } = await createLoan();
      dealId = createdDealId;
      loanId = createdLoanId;
      aLoanUrl = `/v1/deals/${dealId}/loan/${loanId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(aLoanUrl),
      makeRequestWithAuthHeader: (authHeader) => get(aLoanUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).withBankName('Bank 1').one(),
      makeRequestAsUser: (user) => as(user).get(aLoanUrl),
      successStatusCode: 200,
    });

    it('400s requests that do not present with a valid deal id parameter', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/deals/1345/loan/620a1aa095a618b12da38c7b');

      expect(status).toEqual(400);
    });

    it('400s requests that do not present with a valid loan id parameter', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/deals/620a1aa095a618b12da38c7b/loan/12345');

      expect(status).toEqual(400);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const { status } = await as(anHSBCMaker).get(`/v1/deals/${dealId}/loan/620a1aa095a618b12da38c7b`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/deals/620a1aa095a618b12da38c7b/loan/620a1aa095a618b12da38c7b');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown loan', async () => {
      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/loan/620a1aa095a618b12da38c7b`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { status } = await as(aSuperuser).get(`/v1/deals/${dealId}/loan/${loanId}`);

      expect(status).toEqual(200);
    });

    it('returns a loan with dealId, `Incomplete` status', async () => {
      await updateLoan(dealId, loanId, {});

      const { status, body } = await as(aSuperuser).get(`/v1/deals/${dealId}/loan/${loanId}`);

      expect(status).toEqual(200);
      expect(body.loan._id).toEqual(loanId);
      expect(body.loan.status).toEqual('Incomplete');
      expect(body.dealId).toEqual(dealId);
    });

    describe('when a loan has all required fields', () => {
      it('returns a loan with dealId and `Completed` status', async () => {
        const { dealId: createdDealId, loanId: createdLoanId } = await createLoan();

        const loan = {
          facilityStage: 'Unconditional',
          hasBeenIssued: true,
          name: '1234',
          ...requestedCoverStartDate(),
          ...coverEndDate(),
          disbursementAmount: '5',
          value: '100',
          currencySameAsSupplyContractCurrency: 'true',
          interestMarginFee: '10',
          coveredPercentage: '40',
          premiumType: 'At maturity',
          dayCountBasis: '365',
        };

        await updateLoan(createdDealId, createdLoanId, loan);
        const { status, body } = await as(aSuperuser).get(`/v1/deals/${createdDealId}/loan/${createdLoanId}`);

        expect(status).toEqual(200);
        expect(body.loan._id).toEqual(createdLoanId);
        expect(body.validationErrors.count).toEqual(0);
        expect(body.loan.status).toEqual('Completed');
        expect(body.dealId).toEqual(createdDealId);
      });
    });
  });

  describe('PUT /v1/deals/:id/loan/:id', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id;
      const { status } = await as().put({}).to(`/v1/deals/${dealId}/loan/12345678`);

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id;
      const { status } = await as(testUsers).put({}).to(`/v1/deals/${dealId}/loan/12345678`);

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id;
      const { status } = await as(anHSBCMaker).put({}).to(`/v1/deals/${dealId}/loan/12345678`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(aBarclaysMaker).put({}).to('/v1/deals/620a1aa095a618b12da38c7b/loan/620a1aa095a618b12da38c7b');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown loan', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id;

      const { status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/620a1aa095a618b12da38c7b`);

      expect(status).toEqual(404);
    });

    it('400s requests if deal id is invalid', async () => {
      await as(aBarclaysMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(aBarclaysMaker).put({}).to('/v1/deals/12345/loan/create');

      expect(status).toEqual(400);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id;

      const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      const { loanId } = createLoanResponse.body;

      const conditionalLoan = {
        facilityStage: 'Conditional',
        hasBeenIssued: false,
        ukefGuaranteeInMonths: '12',
        value: '100',
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
        value: '100',
        coveredPercentage: '40',
        interestMarginFee: '10',
      };

      const { body } = await updateLoan(dealId, loanId, loan);

      const expectedGuaranteeFee = calculateGuaranteeFee(loan.interestMarginFee);
      const expectedUkefExposure = calculateUkefExposure(loan.value, loan.coveredPercentage);

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
          value: '100',
          currencySameAsSupplyContractCurrency: 'true',
          interestMarginFee: '10',
          coveredPercentage: '40',
          premiumType: 'At maturity',
          dayCountBasis: '365',
        };

        const { body: firstUpdateBody } = await updateLoan(dealId, loanId, conditionalLoan);
        expect(firstUpdateBody.hasBeenIssued).toEqual(false);

        const updateToUnconditionalLoan = {
          ...conditionalLoan,
          facilityStage: 'Unconditional',
          name: '1234',
          ...requestedCoverStartDate(),
          ...coverEndDate(),
          disbursementAmount: '5',
        };

        const { status, body } = await updateLoan(dealId, loanId, updateToUnconditionalLoan);

        expect(status).toEqual(200);
        expect(body.hasBeenIssued).toEqual(true);
        expect(body.ukefGuaranteeInMonths).toEqual(null);
      });
    });

    describe('when req.body.facilityStage is `Conditional`', () => {
      it('should remove `Unconditional` related values from the loan (but retain name)', async () => {
        const { dealId, loanId } = await createLoan();

        const unconditionalLoan = {
          facilityStage: 'Unconditional',
          name: '1234',
          value: '100',
          currencySameAsSupplyContractCurrency: 'true',
          interestMarginFee: '10',
          coveredPercentage: '40',
          ...requestedCoverStartDate(),
          ...coverEndDate(),
          disbursementAmount: '5',
          premiumType: 'At maturity',
          dayCountBasis: '365',
        };

        const { body: firstUpdateBody } = await updateLoan(dealId, loanId, unconditionalLoan);
        expect(firstUpdateBody.hasBeenIssued).toEqual(true);

        const updateToConditionalLoan = {
          ...unconditionalLoan,
          facilityStage: 'Conditional',
          ukefGuaranteeInMonths: '12',
        };

        const { status, body } = await updateLoan(dealId, loanId, updateToConditionalLoan);

        expect(status).toEqual(200);
        expect(body.hasBeenIssued).toEqual(false);
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

    it("should add the deal's supplyContractCurrency to the loan's currency", async () => {
      const { dealId, loanId } = await createLoan();

      const loan = {
        facilityStage: 'Conditional',
        hasBeenIssued: false,
        ukefGuaranteeInMonths: '12',
        value: '100',
        currencySameAsSupplyContractCurrency: 'true',
        interestMarginFee: '10',
        coveredPercentage: '40',
        premiumType: 'At maturity',
        dayCountBasis: '365',
      };

      const { status, body } = await updateLoan(dealId, loanId, loan);

      expect(status).toEqual(200);
      const { data: expectedCurrency } = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);
      expect(body.currency).toEqual({
        currencyId: expectedCurrency.currencyId,
        text: expectedCurrency.text,
        id: expectedCurrency.id,
      });
    });

    describe('when req.body.currencySameAsSupplyContractCurrency is changed from false to true', () => {
      it("should remove `currency is NOT the same` values from the loan and add the deal's supplyContractCurrency", async () => {
        const { dealId, loanId } = await createLoan();

        const loan = {
          facilityStage: 'Conditional',
          hasBeenIssued: false,
          ukefGuaranteeInMonths: '12',
          value: '100',
          currencySameAsSupplyContractCurrency: 'false',
          interestMarginFee: '10',
          coveredPercentage: '40',
          currency: 'EUR',
          conversionRate: '100',
          'conversionRateDate-day': format(nowDate, 'dd'),
          'conversionRateDate-month': format(nowDate, 'MM'),
          'conversionRateDate-year': format(nowDate, 'yyyy'),
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

        const { data: expectedCurrency } = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);
        expect(body.currency).toEqual({
          currencyId: expectedCurrency.currencyId,
          text: expectedCurrency.text,
          id: expectedCurrency.id,
        });
      });
    });

    describe("when req.body.premiumType is changed to 'At maturity'", () => {
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
        hasBeenIssued: true,
        name: '1234',
        ...requestedCoverStartDate(),
        ...coverEndDate(),
        disbursementAmount: '5',
        value: '100',
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

    it('should generate updatedAt timestamp', async () => {
      const { dealId, loanId } = await createLoan();

      const loan = {
        facilityStage: 'Unconditional',
        hasBeenIssued: true,
        name: '1234',
      };

      await updateLoan(dealId, loanId, loan);
      const { status, body } = await as(aSuperuser).get(`/v1/deals/${dealId}/loan/${loanId}`);

      expect(status).toEqual(200);
      expect(body.loan.updatedAt).toEqual(expect.any(Number));
    });

    it("should update the associated deal's facilitiesUpdated timestamp", async () => {
      // create deal
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = deal.body._id;

      // create loan facility
      const { body: createdLoan } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      const { loanId } = createdLoan;

      const loanUpdate = { test: true };

      // update loan facility
      await as(aBarclaysMaker).put(loanUpdate).to(`/v1/deals/${dealId}/loan/${loanId}`);

      // get the deal, check facilities timestamp
      const { body: dealAfterUpdate } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);
      expect(dealAfterUpdate.deal.facilitiesUpdated).toEqual(expect.any(Number));
    });
  });

  describe('PUT /v1/deals/:id/loan/create', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put().to('/v1/deals/620a1aa095a618b12da38c7b/loan/create');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(testUsers).put().to('/v1/deals/620a1aa095a618b12da38c7b/loan/create');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id;

      const { status } = await as(anHSBCMaker).put().to(`/v1/deals/${dealId}/loan/create`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await as(aBarclaysMaker).put().to('/v1/deals/620a1aa095a618b12da38c7b/loan/create');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id;

      const { status } = await as(aSuperuser).put({}).to(`/v1/deals/${dealId}/loan/create`);

      expect(status).toEqual(200);
    });

    it('adds an empty loan to a deal, with facility createdDate, type', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = deal.body._id;

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);

      const { status, body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      expect(status).toEqual(200);
      expect(body.deal.loanTransactions.items.length).toEqual(1);
      expect(body.deal.loanTransactions.items[0]._id).toBeDefined();
      expect(typeof body.deal.loanTransactions.items[0].createdDate).toEqual('number');
      expect(body.deal.loanTransactions.items[0].type).toEqual('Loan');
    });

    it('adds an empty loan to a deal', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = deal.body._id;

      const newLoan = {
        type: 'Loan',
        dealId,
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
      const { status } = await as(testUsers).remove(`/v1/deals/${dealId}/loan/12345678`);

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const { status } = await as(anHSBCMaker).remove(`/v1/deals/${dealId}/loan/12345678`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(aBarclaysMaker).remove('/v1/deals/620a1aa095a618b12da38c7b/loan/620a1aa095a618b12da38c7b');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown loan', async () => {
      const { status } = await as(aBarclaysMaker).remove(`/v1/deals/${dealId}/loan/620a1aa095a618b12da38c7b`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { status } = await as(aBarclaysMaker).remove(`/v1/deals/${dealId}/loan/${loanId}`);
      expect(status).toEqual(200);
    });

    it('removes a loan from a deal', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      dealId = deal.body._id;

      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
      await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);

      const { body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}`);

      const createdDeal = body.deal;
      expect(createdDeal.loanTransactions.items.length).toEqual(3);

      const loanIdToDelete = createdDeal.loanTransactions.items[1]._id;

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
