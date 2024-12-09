const { sub, format, add } = require('date-fns');
const { CURRENCY, MONGO_DB_COLLECTIONS } = require('@ukef/dtfs2-common');
const databaseHelper = require('../../database-helper');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { MAKER, ADMIN } = require('../../../src/v1/roles/roles');
const mockEligibilityCriteria = require('../../fixtures/eligibilityCriteria');

describe('/v1/deals/:id/loan/change-cover-start-date', () => {
  const nowDate = new Date();

  const newDeal = aDeal({
    submissionType: 'Automatic Inclusion Notice',
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    details: {
      submissionDate: nowDate.valueOf(),
    },
    submissionDetails: {
      supplyContractCurrency: {
        id: CURRENCY.GBP,
      },
    },
  });

  let aBarclaysMaker;
  let anHSBCMaker;
  let aSuperuser;

  let dealId;
  let loanId;

  const mockCoverStartDate = sub(nowDate, { months: 1 });

  const mockLoan = {
    facilityStage: 'Unconditional',
    hasBeenIssued: true,
    'requestedCoverStartDate-day': format(mockCoverStartDate, 'dd'),
    'requestedCoverStartDate-month': format(mockCoverStartDate, 'MM'),
    'requestedCoverStartDate-year': format(mockCoverStartDate, 'yyyy'),
  };

  const updateLoan = async (bssDealId, bssLoanId, body) => {
    const result = await as(aBarclaysMaker).put(body).to(`/v1/deals/${bssDealId}/loan/${bssLoanId}`);
    return result.body;
  };

  const updateLoanCoverStartDate = async (bssDealId, bssLoanId, loan) => {
    const response = await as(aBarclaysMaker).put(loan).to(`/v1/deals/${bssDealId}/loan/${bssLoanId}/change-cover-start-date`);
    return response;
  };

  const createDealAndLoan = async () => {
    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
    dealId = deal.body._id;

    const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
    const { loanId: _id } = createLoanResponse.body;

    loanId = _id;

    const getCreatedLoan = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/loan/${loanId}`);

    const modifiedLoan = {
      ...getCreatedLoan.body.loan,
      ...mockLoan,
    };

    const updatedLoan = await updateLoan(dealId, loanId, modifiedLoan);
    return updatedLoan.body;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);

    aBarclaysMaker = testUsers().withRole(MAKER).withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole(MAKER).withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
    const anAdmin = testUsers().withRole(ADMIN).one();

    await databaseHelper.wipe([MONGO_DB_COLLECTIONS.ELIGIBILITY_CRITERIA]);
    await as(anAdmin).post(mockEligibilityCriteria[0]).to('/v1/eligibility-criteria');
  });

  beforeEach(async () => {
    await databaseHelper.wipe([MONGO_DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([MONGO_DB_COLLECTIONS.FACILITIES]);
    await createDealAndLoan();
  });

  describe('GET /v1/deals/:id/loan/:id/change-cover-start-date', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as({}).put({}).to(`/v1/deals/${dealId}/loan/620a1aa095a618b12da38c7b/change-cover-start-date`);

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(anHSBCMaker).put({}).to(`/v1/deals/${dealId}/loan/620a1aa095a618b12da38c7b/change-cover-start-date`);

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const deal = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      dealId = deal.body._id;

      const { status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/620a1aa095a618b12da38c7b/change-cover-start-date`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(aBarclaysMaker).put({}).to('/v1/deals/620a1aa095a618b12da38c7b/loan/620a1aa095a618b12da38c7b/change-cover-start-date');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown loan', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      dealId = deal.body._id;

      const { status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/620a1aa095a618b12da38c7b/change-cover-start-date`);

      expect(status).toEqual(404);
    });

    it('should return 400 if <user>.bank.id == *', async () => {
      const { status } = await as(aSuperuser).put({}).to(`/v1/deals/${dealId}/loan/${loanId}/change-cover-start-date`);

      expect(status).toEqual(400);
    });

    describe('when loan.facilityStage is not `Unconditional`', () => {
      it('should return 400', async () => {
        const conditionalLoanBody = {
          facilityStage: 'Conditional',
          hasBeenIssued: false,
        };
        const body = await updateLoan(dealId, loanId, conditionalLoanBody);

        const { status } = await updateLoanCoverStartDate(dealId, loanId, body);
        expect(status).toEqual(400);
      });
    });

    describe('when requestedCoverStartDate is invalid', () => {
      const invalidCoverStartDate = () => {
        const date = add(nowDate, { months: 4 });
        return {
          'requestedCoverStartDate-day': format(date, 'dd'),
          'requestedCoverStartDate-month': format(date, 'MM'),
          'requestedCoverStartDate-year': format(date, 'yyyy'),
        };
      };

      it('should return 400 with the invalid date', async () => {
        const invalidRequestedCoverStartDate = invalidCoverStartDate();

        const updateCoverStartDateBody = {
          ...invalidRequestedCoverStartDate,
        };

        const { body, status } = await updateLoanCoverStartDate(dealId, loanId, updateCoverStartDateBody);
        expect(status).toEqual(400);
        expect(body.loan['requestedCoverStartDate-day']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-day']);
        expect(body.loan['requestedCoverStartDate-month']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-month']);
        expect(body.loan['requestedCoverStartDate-year']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-year']);
      });

      it('should NOT update the loan', async () => {
        const invalidRequestedCoverStartDate = invalidCoverStartDate();

        const updateCoverStartDateBody = {
          ...invalidRequestedCoverStartDate,
        };

        await updateLoanCoverStartDate(dealId, loanId, updateCoverStartDateBody);

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}/loan/${loanId}`);
        expect(body.loan['requestedCoverStartDate-day']).toEqual(mockLoan['requestedCoverStartDate-day']);
        expect(body.loan['requestedCoverStartDate-month']).toEqual(mockLoan['requestedCoverStartDate-month']);
        expect(body.loan['requestedCoverStartDate-year']).toEqual(mockLoan['requestedCoverStartDate-year']);
      });
    });

    describe('with a valid requestedCoverStartDate', () => {
      const validRequestedCoverStartDate = {
        'requestedCoverStartDate-day': format(nowDate, 'dd'),
        'requestedCoverStartDate-month': format(nowDate, 'MM'),
        'requestedCoverStartDate-year': format(nowDate, 'yyyy'),
      };
      const updateCoverStartDateBody = {
        ...validRequestedCoverStartDate,
      };

      it('should return 200 with the new date', async () => {
        await updateLoanCoverStartDate(dealId, loanId, updateCoverStartDateBody);

        const { status, body } = await as(aSuperuser).get(`/v1/deals/${dealId}/loan/${loanId}`);
        expect(status).toEqual(200);
        expect(body.loan['requestedCoverStartDate-day']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-day']);
        expect(body.loan['requestedCoverStartDate-month']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-month']);
        expect(body.loan['requestedCoverStartDate-year']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-year']);
      });

      it('should update the loan', async () => {
        await updateLoanCoverStartDate(dealId, loanId, updateCoverStartDateBody);

        await as(aSuperuser).get(`/v1/deals/${dealId}/loan/${loanId}`);

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}/loan/${loanId}`);
        expect(body.loan['requestedCoverStartDate-day']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-day']);
        expect(body.loan['requestedCoverStartDate-month']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-month']);
        expect(body.loan['requestedCoverStartDate-year']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-year']);
      });
    });
  });
});
