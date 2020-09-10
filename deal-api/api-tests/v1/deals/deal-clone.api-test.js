const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed');
const { as } = require('../../api')(app);

const newDeal = aDeal({
  details: {
    bankSupplyContractName: 'mock name',
    bankSupplyContractID: 'mock id',
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
  editedBy: [
    { userId: '1' },
    { userId: '2' },
    { userId: '3' },
    { userId: '4' },
  ],
});

describe('/v1/deals/:id/clone', () => {
  let noRoles;
  let anHSBCMaker;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
  });

  describe('POST /v1/deals/:id/clone', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(newDeal).to('/v1/deals/123456789012/clone');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).post(newDeal).to('/v1/deals/123456789012/clone');

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await as(anHSBCMaker).post(newDeal).to('/v1/deals/123456789012/clone');

      expect(status).toEqual(404);
    });

    describe('with post body', () => {
      let originalDeal;

      beforeEach(async () => {
        const { body } = await as(anHSBCMaker).post(completedDeal).to('/v1/deals');
        originalDeal = body;
      });

      it('clones a deal with only specific properties in `details`, wipes `comments` & `editedBy`, changes `maker` to the user making the request, marks status `Draft`', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const { body } = await as(aBarclaysMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

        expect(body._id).toEqual(body._id);
        expect(body.details.bankSupplyContractID).toEqual(clonePostBody.bankSupplyContractID);
        expect(body.details.bankSupplyContractName).toEqual(clonePostBody.bankSupplyContractName);
        expect(body.details.dateOfLastAction).toBeDefined();
        expect(body.details.submissionType).toEqual(originalDeal.details.submissionType);

        expect(body.details.maker.username).toEqual(aBarclaysMaker.username);
        expect(body.details.maker.roles).toEqual(aBarclaysMaker.roles);
        expect(body.details.maker.bank).toEqual(aBarclaysMaker.bank);
        expect(body.details.maker.firstname).toEqual(aBarclaysMaker.firstname);
        expect(body.details.maker.surname).toEqual(aBarclaysMaker.surname);
        expect(body.details.maker._id).toEqual(aBarclaysMaker._id);

        expect(body.details.owningBank).toEqual(aBarclaysMaker.bank);
        expect(body.details.status).toEqual('Draft');
        expect(body.comments).toEqual([]);
        expect(body.editedBy).toEqual([]);
      });

      // TODO: test other things in deal object.
      // eligibility
      // submissionDetails
      // summary
      // comments
      // supplyContractCurrency

      it('clones a deal with only specific bondTransactions fields', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const { body } = await as(anHSBCMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

        const firstOriginalBond = originalDeal.bondTransactions.items[0];
        const secondOriginalBond = originalDeal.bondTransactions.items[1];

        const expectedFirstBondTransaction = {
          bondStage: firstOriginalBond.bondStage,
          requestedCoverStartDate: firstOriginalBond.requestedCoverStartDate,
          'coverEndDate-day': firstOriginalBond['coverEndDate-day'],
          'coverEndDate-month': firstOriginalBond['coverEndDate-month'],
          'coverEndDate-year': firstOriginalBond['coverEndDate-year'],
          facilityValue: firstOriginalBond.facilityValue,
          currencySameAsSupplyContractCurrency: firstOriginalBond.currencySameAsSupplyContractCurrency,
          currency: firstOriginalBond.currency,
          conversionRate: firstOriginalBond.conversionRate,
          'conversionRateDate-day': firstOriginalBond['conversionRateDate-day'],
          'conversionRateDate-month': firstOriginalBond['conversionRateDate-month'],
          'conversionRateDate-year': firstOriginalBond['conversionRateDate-year'],
          uniqueIdentificationNumber: firstOriginalBond.uniqueIdentificationNumber,
          ukefGuaranteeInMonths: firstOriginalBond.ukefGuaranteeInMonths,
          createdDate: expect.any(String),
        };
        const expectedSecondBondTransaction = {
          bondStage: secondOriginalBond.bondStage,
          requestedCoverStartDate: secondOriginalBond.requestedCoverStartDate,
          'coverEndDate-day': secondOriginalBond['coverEndDate-day'],
          'coverEndDate-month': secondOriginalBond['coverEndDate-month'],
          'coverEndDate-year': secondOriginalBond['coverEndDate-year'],
          facilityValue: secondOriginalBond.facilityValue,
          currencySameAsSupplyContractCurrency: secondOriginalBond.currencySameAsSupplyContractCurrency,
          currency: secondOriginalBond.currency,
          uniqueIdentificationNumber: secondOriginalBond.uniqueIdentificationNumber,
          ukefGuaranteeInMonths: secondOriginalBond.ukefGuaranteeInMonths,
          createdDate: expect.any(String),
        };

        expect(body.bondTransactions.items[0]).toMatchObject(expectedFirstBondTransaction);
        expect(body.bondTransactions.items[0]._id).not.toEqual(firstOriginalBond._id);
        expect(body.bondTransactions.items[1]).toMatchObject(expectedSecondBondTransaction);
        expect(body.bondTransactions.items[1]._id).not.toEqual(secondOriginalBond._id);
      });

      it('clones a deal with only specific loanTransactions fields', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const { body } = await as(anHSBCMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

        const firstOriginalLoan = originalDeal.loanTransactions.items[0];
        const secondOriginalLoan = originalDeal.loanTransactions.items[1];

        const expectedFirstLoanTransaction = {
          bankReferenceNumber: firstOriginalLoan.bankReferenceNumber,
          facilityValue: firstOriginalLoan.facilityValue,
          currencySameAsSupplyContractCurrency: firstOriginalLoan.currencySameAsSupplyContractCurrency,
          currency: firstOriginalLoan.currency,
          ukefGuaranteeInMonths: firstOriginalLoan.ukefGuaranteeInMonths,
          requestedCoverStartDate: firstOriginalLoan.requestedCoverStartDate,
          'coverEndDate-day': firstOriginalLoan['coverEndDate-day'],
          'coverEndDate-month': firstOriginalLoan['coverEndDate-month'],
          'coverEndDate-year': firstOriginalLoan['coverEndDate-year'],
          createdDate: expect.any(String),
        };

        const expectedSecondLoanTransaction = {
          requestedCoverStartDate: secondOriginalLoan.requestedCoverStartDate,
          'coverEndDate-day': secondOriginalLoan['coverEndDate-day'],
          'coverEndDate-month': secondOriginalLoan['coverEndDate-month'],
          'coverEndDate-year': secondOriginalLoan['coverEndDate-year'],
          bankReferenceNumber: secondOriginalLoan.bankReferenceNumber,
          facilityValue: secondOriginalLoan.facilityValue,
          currencySameAsSupplyContractCurrency: secondOriginalLoan.currencySameAsSupplyContractCurrency,
          currency: secondOriginalLoan.currency,
          conversionRate: secondOriginalLoan.conversionRate,
          'conversionRateDate-day': secondOriginalLoan['conversionRateDate-day'],
          'conversionRateDate-month': secondOriginalLoan['conversionRateDate-month'],
          'conversionRateDate-year': secondOriginalLoan['conversionRateDate-year'],
          disbursementAmount: secondOriginalLoan.disbursementAmount,
          ukefGuaranteeInMonths: secondOriginalLoan.ukefGuaranteeInMonths,
          createdDate: expect.any(String),
        };

        expect(body.loanTransactions.items[0]).toMatchObject(expectedFirstLoanTransaction);
        expect(body.loanTransactions.items[0]._id).not.toEqual(firstOriginalLoan._id);
        expect(body.loanTransactions.items[1]).toMatchObject(expectedSecondLoanTransaction);
        expect(body.loanTransactions.items[1]._id).not.toEqual(secondOriginalLoan._id);
      });

      it('returns empty bondTransactions and loanTransactions when empty in original deal', async () => {
        const dealWithEmptyBondsAndLoans = {
          ...completedDeal,
          bondTransactions: { items: [] },
          loanTransactions: { items: [] },
        };

        const { body } = await as(anHSBCMaker).post(dealWithEmptyBondsAndLoans).to('/v1/deals');
        originalDeal = body;

        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const { body: responseBody } = await as(anHSBCMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

        expect(responseBody.bondTransactions).toEqual({
          items: [],
        });
        expect(responseBody.loanTransactions).toEqual({
          items: [],
        });
      });

      describe('when req.body has cloneTransactions set to false', () => {
        it('clones a deal with empty transactions', async () => {
          const clonePostBody = {
            bankSupplyContractID: 'new-bank-deal-id',
            bankSupplyContractName: 'new-bank-deal-name',
            cloneTransactions: 'false',
          };
          const { body } = await as(anHSBCMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

          expect(body.bondTransactions).toEqual({
            items: [],
          });
          expect(body.loanTransactions).toEqual({
            items: [],
          });
        });
      });

      describe('when required fields are missing', () => {
        it('returns validation errors', async () => {
          const clonePostBody = {
            bankSupplyContractID: '',
            bankSupplyContractName: '',
            cloneTransactions: '',
          };
          const { body } = await as(anHSBCMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

          expect(body.validationErrors.count).toEqual(3);
          expect(body.validationErrors.errorList.bankSupplyContractID).toBeDefined();
          expect(body.validationErrors.errorList.bankSupplyContractName).toBeDefined();
          expect(body.validationErrors.errorList.cloneTransactions).toBeDefined();
        });
      });
    });
  });
});
