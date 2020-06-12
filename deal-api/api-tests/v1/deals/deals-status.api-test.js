const moment = require('moment');
const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-full-completed');

const { as } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

// Mock currency & country API calls as no currency/country data is in db during test
jest.mock('../../../src/v1/controllers/integration/helpers/convert-country-code-to-id', () => () => 900);
jest.mock('../../../src/v1/controllers/integration/helpers/convert-currency-code-to-id', () => () => 900);


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

describe('/v1/deals/:id/status', () => {
  let noRoles;
  let aBarclaysMaker;
  let anotherBarclaysMaker;
  let anHSBCMaker;
  let aBarclaysChecker;
  let aSuperuser;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    const barclaysMakers = testUsers().withRole('maker').withBankName('Barclays Bank').all();
    aBarclaysMaker = barclaysMakers[0];
    anotherBarclaysMaker = barclaysMakers[1];
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
  });

  describe('GET /v1/deals/:id/status', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().get('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker || role=checker', async () => {
      const { status } = await as(noRoles).get('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('accepts requests from a user with role=maker', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(anHSBCMaker).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const { body } = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(aBarclaysChecker).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(200);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/deals/123456789012/status');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const { status } = await as(aSuperuser).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, text } = await as(anHSBCMaker).get(`/v1/deals/${newId}/status`);

      expect(status).toEqual(200);
      expect(text).toEqual('Draft');
    });
  });

  describe('PUT /v1/deals/:id/status', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(newDeal).to('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put(newDeal).to('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { body } = await as(anHSBCMaker).post(newDeal).to('/v1/deals');

      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      const { status } = await as(aBarclaysMaker).put(statusUpdate).to(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await as(anHSBCMaker).put(newDeal).to('/v1/deals/123456789012/status');

      expect(status).toEqual(404);
    });

    it('returns the updated status', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      const { status, text } = await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(status).toEqual(200);
      expect(text).toEqual('Abandoned Deal');
    });

    it('updates the deal', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.details.status).toEqual('Abandoned Deal');
    });

    it('updates the deals details.dateOfLastAction field', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.details.dateOfLastAction).not.toEqual(newDeal.details.dateOfLastAction);
    });

    it('updates details.previousStatus', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(body.details.previousStatus).toEqual('Draft');
    });

    it('adds the comment to the existing comments', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(body.comments[2]).toEqual({
        text: 'Flee!',
        username: anHSBCMaker.username,
        timestamp: expect.any(String),
      });
    });

    it('rejects "Abandoned Deal" updates if no comment provided.', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Abandoned Deal',
      };

      const { status, body } = await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          comments: {
            order: '1',
            text: 'Comment is required when abandoning a deal.',
          },
        },
      });
    });

    it("rejects 'Ready for Checker's approval' updates if no comment provided.", async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: "Ready for Checker's approval",
      };

      const { status, body } = await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          comments: {
            order: '1',
            text: 'Comment is required when submitting a deal for review.',
          },
        },
      });
    });

    it('rejects "Further makers Input Required" updates if no comment provided.', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: "Further Maker's input required",
      };

      const { status, body } = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          comments: {
            order: '1',
            text: 'Comment is required when returning a deal to maker.',
          },
        },
      });
    });

    it('rejects "Submitted" updates if t+cs not confirmed.', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        status: 'Submitted',
      };

      const { status, body } = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      expect(body).toEqual({
        success: false,
        count: 1,
        errorList: {
          confirmSubmit: {
            order: '1',
            text: 'Acceptance is required.',
          },
        },
      });
    });

    describe('when the status changes from `Draft` to `Ready for Checker\'s approval`', () => {
      const coverEndDate = () => ({
        'coverEndDate-day': moment().add(1, 'month').format('DD'),
        'coverEndDate-month': moment().add(1, 'month').format('MM'),
        'coverEndDate-year': moment().add(1, 'month').format('YYYY'),
      });

      const expectedRequestedCoverStartDate = () => ({
        'requestedCoverStartDate-day': moment().format('DD'),
        'requestedCoverStartDate-month': moment().format('MM'),
        'requestedCoverStartDate-year': moment().format('YYYY'),
      });

      const statusUpdate = {
        comments: 'Ready to go!',
        status: 'Ready for Checker\'s approval',
      };

      const postDealAndUpdateStatus = async (deal, status) => {
        const postResult = await as(anHSBCMaker).post(deal).to('/v1/deals');
        const createdDeal = postResult.body;

        await as(anHSBCMaker).put(status).to(`/v1/deals/${createdDeal._id}/status`);

        const response = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);
        return response;
      };

      describe('when a deal contains bonds with an `Issued` bondStage that do NOT have a requestedCoverStartDate', () => {
        it('should add todays date to such bonds', async () => {
          const baseBond = {
            bondIssuer: 'issuer',
            bondType: 'bond type',
            bondBeneficiary: 'test',
            bondValue: '123',
            transactionCurrencySameAsSupplyContractCurrency: 'true',
            riskMarginFee: '1',
            coveredPercentage: '2',
            feeType: 'test',
            feeFrequency: 'test',
            dayCountBasis: 'test',
          };

          const issuedBondFields = () => ({
            bondStage: 'Issued',
            uniqueIdentificationNumber: '1234',
            ...coverEndDate(),
          });

          const newDealWithBonds = {
            ...newDeal,
            bondTransactions: {
              items: [
                {
                  ...baseBond,
                  bondStage: 'Unissued',
                  ukefGuaranteeInMonths: '24',
                },
                {
                  ...baseBond,
                  ...issuedBondFields(),
                },
                {
                  ...baseBond,
                  ...issuedBondFields(),
                },
              ],
            },
          };

          const { status, body } = await postDealAndUpdateStatus(newDealWithBonds, statusUpdate);

          expect(status).toEqual(200);
          expect(body.details.status).toEqual(statusUpdate.status);

          expect(body.bondTransactions.items[0]).toEqual({
            ...newDealWithBonds.bondTransactions.items[0],
            status: 'Completed',
          });

          expect(body.bondTransactions.items[1]).toEqual({
            ...newDealWithBonds.bondTransactions.items[1],
            status: 'Completed',
            ...expectedRequestedCoverStartDate(),
          });

          expect(body.bondTransactions.items[2]).toEqual({
            ...newDealWithBonds.bondTransactions.items[2],
            status: 'Completed',
            ...expectedRequestedCoverStartDate(),
          });
        });
      });

      describe('when a deal contains loans with an `Unconditional` facilityStage that do NOT have a requestedCoverStartDate', () => {
        it('should add todays date to such loans', async () => {
          const unconditionalLoan = () => ({
            facilityStage: 'Unconditional',
            bankReferenceNumber: 'test',
            ...coverEndDate(),
          });

          const conditionalLoan = () => ({
            facilityStage: 'Conditional',
            ukefGuaranteeInMonths: '24',
          });

          const newDealWithLoans = {
            ...newDeal,
            loanTransactions: {
              items: [
                conditionalLoan(),
                unconditionalLoan(),
                unconditionalLoan(),
              ],
            },
          };

          const { status, body } = await postDealAndUpdateStatus(newDealWithLoans, statusUpdate);

          expect(status).toEqual(200);
          expect(body.details.status).toEqual(statusUpdate.status);

          expect(body.loanTransactions.items[0]).toEqual({
            ...newDealWithLoans.loanTransactions.items[0],
            // status: 'Completed',
          });

          expect(body.loanTransactions.items[1]).toEqual({
            ...newDealWithLoans.loanTransactions.items[1],
            // status: 'Completed',
            ...expectedRequestedCoverStartDate(),
          });

          expect(body.loanTransactions.items[2]).toEqual({
            ...newDealWithLoans.loanTransactions.items[2],
            // status: 'Completed',
            ...expectedRequestedCoverStartDate(),
          });
        });
      });
    });

    xdescribe('valid typeA xml is created', () => {
      it('creates type_a xml if deal successfully submitted', async () => {
        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

        const createdDeal = postResult.body;
        const statusUpdate = {
          status: 'Submitted',
          confirmSubmit: true,
        };

        const { status, body } = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

        expect(body).toEqual({});
      });
    });
  });
});
