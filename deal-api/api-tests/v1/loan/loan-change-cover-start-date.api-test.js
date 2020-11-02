const moment = require('moment');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

describe('/v1/deals/:id/loan/change-cover-start-date', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
      submissionType: 'Automatic Inclusion Notice',
    },
    submissionDetails: {
      supplyContractCurrency: {
        id: 'GBP',
      },
    },
  });

  let noRoles;
  let aBarclaysMaker;
  let anHSBCMaker;
  let aSuperuser;

  let dealId;
  let loanId;

  const mockCoverStartDate = moment().subtract(1, 'month');

  const mockLoan = {
    facilityStage: 'Unconditional',
    'requestedCoverStartDate-day': moment(mockCoverStartDate).format('DD'),
    'requestedCoverStartDate-month': moment(mockCoverStartDate).format('MM'),
    'requestedCoverStartDate-year': moment(mockCoverStartDate).format('YYYY'),
  };

  const updateLoan = async (dealId, loanId, body) => {
    const result = await as(aBarclaysMaker).put(body).to(`/v1/deals/${dealId}/loan/${loanId}`);
    return result.body;
  };

  const updateLoanCoverStartDate = async (dealId, loanId, loan) => {
    const response = await as(aBarclaysMaker).put(loan).to(`/v1/deals/${dealId}/loan/${loanId}/change-cover-start-date`);
    return response;
  };

  const createDealAndLoan = async () => {
    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
    dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

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

    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await createDealAndLoan();
  });

  describe('GET /v1/deals/:id/loan/:id/change-cover-start-date', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as({}).put({}).to(`/v1/deals/${dealId}/loan/123456789012/change-cover-start-date`);

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put({}).to(`/v1/deals/${dealId}/loan/123456789012/change-cover-start-date`);

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const deal = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/123456789012/change-cover-start-date`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(aBarclaysMaker).put({}).to('/v1/deals/123456789012/loan/123456789012/change-cover-start-date');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown loan', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

      const { status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/123456789012/change-cover-start-date`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { status } = await as(aSuperuser).put({}).to(`/v1/deals/${dealId}/loan/${loanId}/change-cover-start-date`);

      expect(status).toEqual(200);
    });

    describe('when loan.facilityStage is not `Unconditional`', () => {
      it('should return 400', async () => {
        const conditionalLoanBody = {
          facilityStage: 'Conditional',
        };
        const body = await updateLoan(dealId, loanId, conditionalLoanBody);

        const { status } = await updateLoanCoverStartDate(dealId, loanId, body);
        expect(status).toEqual(400);
      });
    });

    describe('when requestedCoverStartDate is invalid', () => {
      const invalidCoverStartDate = () => {
        const date = moment().add(4, 'month');
        return {
          'requestedCoverStartDate-day': moment(date).format('DD'),
          'requestedCoverStartDate-month': moment(date).format('MM'),
          'requestedCoverStartDate-year': moment(date).format('YYYY'),
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
      const date = moment();
      const validRequestedCoverStartDate = {
        'requestedCoverStartDate-day': moment(date).format('DD'),
        'requestedCoverStartDate-month': moment(date).format('MM'),
        'requestedCoverStartDate-year': moment(date).format('YYYY'),
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
