const moment = require('moment');
const aDeal = require('../deals/deal-builder');
const wipeDB = require('../../wipeDB');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const { dateValidationText } = require('../../../src/v1/validation/fields/date');

describe('/v1/deals/:id/loan/:loanId/issue-facility', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
      status: 'Acknowledged by UKEF',
      submissionType: 'Manual Inclusion Notice',
      submissionDate: '12345678',
    },
    submissionDetails: {
      supplyContractCurrency: {
        id: 'GBP',
      },
    },
  });

  let aBarclaysMaker;
  let dealId;
  let loanId;

  const updateLoanIssuance = async (theDealId, loan) => {
    const response = await as(aBarclaysMaker).put(loan).to(`/v1/deals/${theDealId}/loan/${loanId}/issue-facility`);
    return response.body;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);

    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
    dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

    const createLoanResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/create`);
    const { loanId: _id } = createLoanResponse.body;

    loanId = _id;

    const getCreatedLoan = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/loan/${loanId}`);

    // TODO
    // add all required Conditional loan fields here
    // TODO: make sure issue-facility endpoint errors
    // if there are missing fields that are required before it can be issued
    const updatedLoan = {
      ...getCreatedLoan.body,
      facilityStage: 'Conditional',
    };

    const laaaa = await as(aBarclaysMaker).put(updatedLoan).to(`/v1/deals/${dealId}/loan/${loanId}`);
  });

  describe('PUT /v1/deals/:id/loan/:loanId/issue-facility', () => {
    // TODO returns 403 when deal is not in correct shape for 'issuing facilities'

    it('returns 400 with validation errors', async () => {
      const { body, status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/loan/${loanId}/issue-facility`);
      expect(status).toEqual(400);
      expect(body.validationErrors.count).toEqual(4);
      expect(body.validationErrors.errorList.issuedDate).toBeDefined();
      expect(body.validationErrors.errorList.coverEndDate).toBeDefined();
      expect(body.validationErrors.errorList.disbursementAmount).toBeDefined();
      expect(body.validationErrors.errorList.bankReferenceNumber).toBeDefined();
    });

    // TODO issuedDate
    // TODO disbursementAmount
    // TODO bankReferenceNumber

    describe('coverEndDate', () => {
      
    });
  });
});
