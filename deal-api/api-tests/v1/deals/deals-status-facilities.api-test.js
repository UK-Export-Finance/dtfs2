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

// jest.unmock('@azure/storage-file-share');

describe('/v1/deals/:id/status - facilities', () => {
  let noRoles;
  let aBarclaysMaker;
  let anotherBarclaysMaker;
  let anHSBCMaker;
  let aBarclaysChecker;
  let aBarclaysMakerChecker;
  let aSuperuser;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    const barclaysMakers = testUsers().withRole('maker').withBankName('Barclays Bank').all();
    aBarclaysMaker = barclaysMakers[0];
    anotherBarclaysMaker = barclaysMakers[1];
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();

    const barclaysMakerChecker = testUsers().withMultipleRoles('maker', 'checker').withBankName('Barclays Bank').one();
    aBarclaysMakerChecker = barclaysMakerChecker;
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
  });

  describe('PUT /v1/deals/:id/status', () => {
    describe('when the deal status changes from `Draft` to `Ready for Checker\'s approval`', () => {
      const coverEndDate = () => ({
        'coverEndDate-day': moment().add(1, 'month').format('DD'),
        'coverEndDate-month': moment().add(1, 'month').format('MM'),
        'coverEndDate-year': moment().add(1, 'month').format('YYYY'),
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
            requestedCoverStartDate: expect.any(String),
          });

          expect(body.deal.bondTransactions.items[2]).toEqual({
            ...newDealWithBonds.bondTransactions.items[2],
            status: 'Completed',
            requestedCoverStartDate: expect.any(String),
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
            requestedCoverStartDate: expect.any(String),
          });

          expect(body.deal.loanTransactions.items[2]).toEqual({
            ...newDealWithLoans.loanTransactions.items[2],
            status: 'Completed',
            requestedCoverStartDate: expect.any(String),
          });
        });
      });
    });
  });
});
