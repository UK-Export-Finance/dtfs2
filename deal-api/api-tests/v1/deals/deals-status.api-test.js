const moment = require('moment');
const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed');

const { as } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

// Mock currency & country API calls as no currency/country data is in db during pipeline test as previous test had removed them
jest.mock('../../../src/v1/controllers/integration/helpers/convert-country-code-to-id', () => () => 826);
jest.mock('../../../src/v1/controllers/integration/helpers/convert-currency-code-to-id', () => () => 12);

jest.unmock('@azure/storage-file-share');

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
      const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');

      const { status } = await as(anHSBCMaker).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(200);
    });

    it('accepts requests from a user with role=checker', async () => {
      const { body } = await as(aBarclaysMaker).post(completedDeal).to('/v1/deals');

      const { status } = await as(aBarclaysChecker).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(200);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');

      const { status } = await as(aBarclaysMaker).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(401);
    });

    it('404s requests for unkonwn ids', async () => {
      const { status } = await as(aBarclaysMaker).get('/v1/deals/123456789012/status');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');

      const { status } = await as(aSuperuser).get(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(200);
    });

    it('returns the requested resource', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const newId = postResult.body._id;

      const { status, text } = await as(anHSBCMaker).get(`/v1/deals/${newId}/status`);

      expect(status).toEqual(200);
      expect(text).toEqual("Ready for Checker's approval");
    });
  });

  describe('PUT /v1/deals/:id/status', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put(completedDeal).to('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put(completedDeal).to('/v1/deals/123456789012/status');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/details.owningBank', async () => {
      const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');

      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      const { status } = await as(aBarclaysMaker).put(statusUpdate).to(`/v1/deals/${body._id}/status`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await as(anHSBCMaker).put(completedDeal).to('/v1/deals/123456789012/status');

      expect(status).toEqual(404);
    });

    it('returns the updated status', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
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
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal.details.status).toEqual('Abandoned Deal');
    });

    it('updates the deals details.dateOfLastAction field', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(status).toEqual(200);
      expect(body.deal.details.dateOfLastAction).not.toEqual(completedDeal.details.dateOfLastAction);
    });

    it('updates details.previousStatus', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(body.deal.details.previousStatus).toEqual("Ready for Checker's approval");
    });

    it('adds the comment to the existing comments', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const statusUpdate = {
        comments: 'Flee!',
        status: 'Abandoned Deal',
      };

      await as(anHSBCMaker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);

      const { status, body } = await as(anHSBCMaker).get(`/v1/deals/${createdDeal._id}`);

      expect(body.deal.comments[0]).toEqual({
        text: 'Flee!',
        timestamp: expect.any(String),
        user: {
          _id: expect.any(String),
          bank: anHSBCMaker.bank,
          roles: anHSBCMaker.roles,
          lastLogin: expect.any(String),
          username: anHSBCMaker.username,
          firstname: anHSBCMaker.firstname,
          surname: anHSBCMaker.surname,
        },
      });
    });

    it('rejects "Abandoned Deal" updates if no comment provided.', async () => {
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
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
      const postResult = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
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
      const postResult = await as(aBarclaysMaker).post(completedDeal).to('/v1/deals');
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
      const postResult = await as(aBarclaysMaker).post(completedDeal).to('/v1/deals');
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
            facilityValue: '123',
            currencySameAsSupplyContractCurrency: 'true',
            riskMarginFee: '1',
            coveredPercentage: '2',
            feeType: 'test',
            feeFrequency: 'test',
            dayCountBasis: 'test',
            currency: { id: 'EUR', text: 'Euros' },
          };

          const issuedBondFields = () => ({
            bondStage: 'Issued',
            uniqueIdentificationNumber: '1234',
            ...coverEndDate(),
          });

          const newDealWithBonds = {
            ...completedDeal,
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

          // explicitly set the status of the deal we're using to be Draft..
          //  -switched to a different test file and got caught by this..
          newDealWithBonds.details.status = 'Draft';

          const { status, body } = await postDealAndUpdateStatus(newDealWithBonds, statusUpdate);

          expect(status).toEqual(200);
          expect(body.deal.details.status).toEqual(statusUpdate.status);

          expect(body.deal.bondTransactions.items[0]).toEqual({
            ...newDealWithBonds.bondTransactions.items[0],
            status: 'Completed',
          });

          expect(body.deal.bondTransactions.items[1]).toEqual({
            ...newDealWithBonds.bondTransactions.items[1],
            status: 'Completed',
            ...expectedRequestedCoverStartDate(),
          });

          expect(body.deal.bondTransactions.items[2]).toEqual({
            ...newDealWithBonds.bondTransactions.items[2],
            status: 'Completed',
            ...expectedRequestedCoverStartDate(),
          });
        });
      });

      describe('when a deal contains loans with an `Unconditional` facilityStage that do NOT have a requestedCoverStartDate', () => {
        it('should add todays date to such loans', async () => {
          const conditionalLoan = () => ({
            facilityStage: 'Conditional',
            ukefGuaranteeInMonths: '12',
            facilityValue: '100',
            currencySameAsSupplyContractCurrency: 'true',
            interestMarginFee: '10',
            coveredPercentage: '40',
            premiumType: 'At maturity',
            dayCountBasis: '365',
            currency: { id: 'EUR', text: 'Euros' },
          });

          const unconditionalLoan = () => ({
            facilityStage: 'Unconditional',
            facilityValue: '100',
            bankReferenceNumber: '1234',
            ...coverEndDate(),
            disbursementAmount: '5',
            currencySameAsSupplyContractCurrency: 'true',
            interestMarginFee: '10',
            coveredPercentage: '40',
            premiumType: 'At maturity',
            dayCountBasis: '365',
            currency: { id: 'EUR', text: 'Euros' },
          });

          const newDealWithLoans = {
            ...completedDeal,
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
          expect(body.deal.details.status).toEqual(statusUpdate.status);

          expect(body.deal.loanTransactions.items[0]).toEqual({
            ...newDealWithLoans.loanTransactions.items[0],
            status: 'Completed',
          });

          expect(body.deal.loanTransactions.items[1]).toEqual({
            ...newDealWithLoans.loanTransactions.items[1],
            status: 'Completed',
            ...expectedRequestedCoverStartDate(),
          });

          expect(body.deal.loanTransactions.items[2]).toEqual({
            ...newDealWithLoans.loanTransactions.items[2],
            status: 'Completed',
            ...expectedRequestedCoverStartDate(),
          });
        });
      });
    });

    describe('when the status changes to `Submitted`', () => {
      let createdDeal;
      let updatedDeal;

      beforeEach(async () => {
        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

        createdDeal = postResult.body;
        const statusUpdate = {
          status: 'Submitted',
          confirmSubmit: true,
        };

        updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${createdDeal._id}/status`);
      });

      xit('adds a submissionDate to the deal', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toEqual({});

        const { body } = await as(aSuperuser).get(`/v1/deals/${createdDeal._id}`);

        expect(body.deal.details.submissionDate).toBeDefined();
        expect(moment(body.deal.details.submissionDate, 'YYYY MM DD HH:mm:ss:SSS ZZ').isValid()).toEqual(true);
      });

      it('creates type_a xml if deal successfully submitted', async () => {
        const files = [
          {
            filename: 'test-file-1.txt',
            filepath: 'api-tests/fixtures/test-file-1.txt',
            fieldname: 'exporterQuestionnaire',
            type: 'general_correspondence',
          },
          {
            filename: 'test-file-2.txt',
            filepath: 'api-tests/fixtures/test-file-2.txt',
            fieldname: 'exporterQuestionnaire',
            type: 'general_correspondence',
          },
          {
            filename: 'test-file-3.txt',
            filepath: 'api-tests/fixtures/test-file-3.txt',
            fieldname: 'auditedFinancialStatements',
            type: 'financials',
          },
        ];

        const submittedDeal = JSON.parse(JSON.stringify(completedDeal));

        const postResult = await as(aBarclaysMaker).post(submittedDeal).to('/v1/deals');

        const createdDeal = postResult.body;

        // Upload supporting docs
        await as(aBarclaysMaker).putMultipartForm({}, files).to(`/v1/deals/${createdDeal._id}/eligibility-documentation`);

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
