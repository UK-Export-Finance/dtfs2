const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed');
const { as } = require('../../api')(app);
const createFacilities = require('../../createFacilities');

const dealToClone = completedDeal;

dealToClone.submissionType = 'Automatic Inclusion Notice';
dealToClone.eligibility = {
  status: 'Incomplete',
  criteria: completedDeal.eligibility.criteria,
  validationErrors: {
    count: 1,
    errorList: {
      1: {
        order: 1,
        text: 'Field is required',
      },
    },
  },
};

dealToClone.editedBy = [
  { userId: '1' },
  { userId: '2' },
  { userId: '3' },
  { userId: '4' },
];

dealToClone.ukefComments = [
  {
    timestamp: '1984/12/25 00:00:00:001',
    text: 'Hello from UKEF',
  },
  {
    timestamp: '1982/12/25 00:00:00:001',
    text: 'Love this deal',
  },
];

dealToClone.specialConditions = [
  {
    timestamp: '1984/12/25 00:00:00:001',
    text: 'This is special',
  },
  {
    timestamp: '1982/12/25 00:00:00:001',
    text: 'Very special',
  },
];

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
    await wipeDB.wipe(['facilities']);
  });

  describe('POST /v1/deals/:id/clone', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().post(dealToClone).to('/v1/deals/123456789012/clone');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).post(dealToClone).to('/v1/deals/123456789012/clone');

      expect(status).toEqual(401);
    });

    it('404s requests for unknown ids', async () => {
      const { status } = await as(anHSBCMaker).post(dealToClone).to('/v1/deals/123456789012/clone');

      expect(status).toEqual(404);
    });

    describe('with post body', () => {
      let originalDeal;
      let createdFacilities;

      beforeEach(async () => {
        const { body: createdDeal } = await as(anHSBCMaker).post(dealToClone).to('/v1/deals');
        const originalDealId = createdDeal._id;
        createdFacilities = await createFacilities(anHSBCMaker, originalDealId, completedDeal.mockFacilities);

        const { body: dealAfterCreation } = await as(anHSBCMaker).get(`/v1/deals/${originalDealId}`);
        originalDeal = dealAfterCreation.deal;
      });

      it('clones a deal with only specific properties in `details`, wipes `comments`, `editedBy` `ukefComments`, `specialConditions`, changes `maker` to the user making the request, marks status `Draft`', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const { body } = await as(aBarclaysMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

        expect(body._id).toEqual(body._id);

        const { body: cloned } = await as(aBarclaysMaker).get(`/v1/deals/${body._id}`);

        expect(cloned.deal.details.bankSupplyContractID).toEqual(clonePostBody.bankSupplyContractID);
        expect(cloned.deal.details.bankSupplyContractName).toEqual(clonePostBody.bankSupplyContractName);
        expect(cloned.deal.details.dateOfLastAction).toBeDefined();
        expect(cloned.deal.submissionType).toEqual(originalDeal.submissionType);

        expect(cloned.deal.details.maker.username).toEqual(aBarclaysMaker.username);
        expect(cloned.deal.details.maker.roles).toEqual(aBarclaysMaker.roles);
        expect(cloned.deal.details.maker.bank).toEqual(aBarclaysMaker.bank);
        expect(cloned.deal.details.maker.firstname).toEqual(aBarclaysMaker.firstname);
        expect(cloned.deal.details.maker.surname).toEqual(aBarclaysMaker.surname);
        expect(cloned.deal.details.maker._id).toEqual(aBarclaysMaker._id);

        expect(cloned.deal.details.owningBank).toEqual(aBarclaysMaker.bank);
        expect(cloned.deal.details.status).toEqual('Draft');
        expect(cloned.deal.editedBy).toEqual([]);
        expect(cloned.deal.comments).toEqual([]);
        expect(cloned.deal.ukefComments).toEqual([]);
        expect(cloned.deal.specialConditions).toEqual([]);
      });

      it('should clone eligibility', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'false',
        };

        const { body } = await as(aBarclaysMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

        const { body: cloned } = await as(aBarclaysMaker).get(`/v1/deals/${body._id}`);

        expect(cloned.deal.eligibility.status).toEqual(originalDeal.eligibility.status);
        const criteriaWithoutId = originalDeal.eligibility.criteria.map(({ _id, ...rest }) => rest);
        expect(cloned.deal.eligibility.criteria).toMatchObject(criteriaWithoutId);
        expect(cloned.deal.eligibility.validationErrors).toEqual(originalDeal.eligibility.validationErrors);
      });

      it('should clone eligibility agent details', async () => {
        const dealToCloneWithEligibilityAgentDetails = {
          ...dealToClone,
          eligibility: {
            ...dealToClone.eligibility,
            agentAddressLine1: completedDeal.agentAddressLine1,
            agentAddressLine2: completedDeal.agentAddressLine2,
            agentAddressLine3: completedDeal.agentAddressLine3,
            agentAddressCountry: completedDeal.agentAddressCountry,
            agentName: completedDeal.agentName,
            agentAddressPostcode: completedDeal.agentAddressPostcode,
            agentAddressTown: completedDeal.agentAddressTown,
          },
        };

        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'false',
        };

        const createDeal = await as(anHSBCMaker).post(dealToCloneWithEligibilityAgentDetails).to('/v1/deals');
        const { _id: dealId } = createDeal.body;

        const { body } = await as(aBarclaysMaker).post(clonePostBody).to(`/v1/deals/${dealId}/clone`);

        const { body: cloned } = await as(aBarclaysMaker).get(`/v1/deals/${body._id}`);

        const { eligibility } = cloned.deal;

        expect(eligibility.agentAddressLine1).toEqual(dealToCloneWithEligibilityAgentDetails.agentAddressLine1);
        expect(eligibility.agentAddressLine2).toEqual(dealToCloneWithEligibilityAgentDetails.agentAddressLine2);
        expect(eligibility.agentAddressLine3).toEqual(dealToCloneWithEligibilityAgentDetails.agentAddressLine3);
        expect(eligibility.agentAddressCountry).toEqual(dealToCloneWithEligibilityAgentDetails.agentAddressCountry);
        expect(eligibility.agentName).toEqual(dealToCloneWithEligibilityAgentDetails.agentName);
        expect(eligibility.agentAddressPostcode).toEqual(dealToCloneWithEligibilityAgentDetails.agentAddressPostcode);
        expect(eligibility.agentAddressTown).toEqual(dealToCloneWithEligibilityAgentDetails.agentAddressTown);
      });

      it('should clone submissionDetails', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const { body } = await as(aBarclaysMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

        const { body: cloned } = await as(aBarclaysMaker).get(`/v1/deals/${body._id}`);

        expect(cloned.deal.submissionDetails).toEqual(originalDeal.submissionDetails);
      });

      it('should clone summary.totalValue', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const { body } = await as(aBarclaysMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

        const { body: cloned } = await as(aBarclaysMaker).get(`/v1/deals/${body._id}`);

        expect(cloned.deal.summary.totalValue).toEqual(originalDeal.summary.totalValue);
      });

      describe('when deal submissionType is MIN', () => {
        it('should change deal submissionType to MIA', async () => {
          const clonePostBody = {
            bankSupplyContractID: 'new-bank-deal-id',
            bankSupplyContractName: 'new-bank-deal-name',
            cloneTransactions: 'true',
          };

          const minDeal = originalDeal;
          minDeal.submissionType = 'Manual Inclusion Notice';

          const { body: minDealBody } = await as(anHSBCMaker).put(minDeal).to(`/v1/deals/${minDeal._id}`);

          const { body } = await as(aBarclaysMaker).post(clonePostBody).to(`/v1/deals/${minDealBody._id}/clone`);

          const { body: cloned } = await as(aBarclaysMaker).get(`/v1/deals/${body._id}`);
          expect(cloned.deal.submissionType).toEqual('Manual Inclusion Application');
        });
      });

      it('clones a deal with only specific bondTransactions fields', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const clonedDealResponse = await as(anHSBCMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);
        const clonedDealId = clonedDealResponse.body._id;

        const getDealResponse = await as(anHSBCMaker).get(`/v1/deals/${clonedDealId}`);
        const clonedDeal = getDealResponse.body.deal;

        const firstOriginalBond = createdFacilities.find((f) => f.facilityType === 'bond');
        const secondOriginalBond = createdFacilities.find((f) =>
          f.facilityType === 'bond'
          && f._id !== firstOriginalBond._id);

        const expectedFirstBondTransaction = {
          facilityType: 'bond',
          facilityStage: firstOriginalBond.facilityStage,
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
          facilityType: 'bond',
          facilityStage: secondOriginalBond.facilityStage,
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

        expect(clonedDeal.bondTransactions.items[0]).toMatchObject(expectedFirstBondTransaction);
        expect(clonedDeal.bondTransactions.items[0]._id).not.toEqual(firstOriginalBond._id);
        expect(clonedDeal.bondTransactions.items[1]).toMatchObject(expectedSecondBondTransaction);
        expect(clonedDeal.bondTransactions.items[1]._id).not.toEqual(secondOriginalBond._id);
      });

      it('clones a deal with only specific loanTransactions fields', async () => {
        const clonePostBody = {
          bankSupplyContractID: 'new-bank-deal-id',
          bankSupplyContractName: 'new-bank-deal-name',
          cloneTransactions: 'true',
        };

        const clonedDealResponse = await as(anHSBCMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);
        const clonedDealId = clonedDealResponse.body._id;

        const getDealResponse = await as(anHSBCMaker).get(`/v1/deals/${clonedDealId}`);
        const clonedDeal = getDealResponse.body.deal;

        const firstOriginalLoan = createdFacilities.find((f) => f.facilityType === 'loan');
        const secondOriginalLoan = createdFacilities.find((f) =>
          f.facilityType === 'loan'
          && f._id !== firstOriginalLoan._id);

        const expectedFirstLoanTransaction = {
          facilityType: 'loan',
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
          facilityType: 'loan',
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

        expect(clonedDeal.loanTransactions.items[0]).toMatchObject(expectedFirstLoanTransaction);
        expect(clonedDeal.loanTransactions.items[0]._id).not.toEqual(firstOriginalLoan._id);
        expect(clonedDeal.loanTransactions.items[1]).toMatchObject(expectedSecondLoanTransaction);
        expect(clonedDeal.loanTransactions.items[1]._id).not.toEqual(secondOriginalLoan._id);
      });

      it('returns empty facilities, bondTransactions and loanTransactions when empty in original deal', async () => {
        const dealWithEmptyBondsAndLoans = {
          ...dealToClone,
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

        const { body: cloned } = await as(anHSBCMaker).get(`/v1/deals/${responseBody._id}`);

        expect(cloned.deal.facilities).toEqual([]);
        expect(cloned.deal.bondTransactions).toEqual({
          items: [],
        });
        expect(cloned.deal.loanTransactions).toEqual({
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
          const { body: responseBody } = await as(anHSBCMaker).post(clonePostBody).to(`/v1/deals/${originalDeal._id}/clone`);

          const { body: cloned } = await as(anHSBCMaker).get(`/v1/deals/${responseBody._id}`);

          expect(cloned.deal.facilities).toEqual([]);
          expect(cloned.deal.bondTransactions).toEqual({
            items: [],
          });
          expect(cloned.deal.loanTransactions).toEqual({
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
