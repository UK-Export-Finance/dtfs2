const moment = require('moment');
const wipeDB = require('../../wipeDB');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed-issued-and-unissued-facilities');

const { as } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');
const { updateDeal } = require('../../../src/v1/controllers/deal.controller');

// Mock currency & country API calls as no currency/country data is in db during pipeline test as previous test had removed them
jest.mock('../../../src/v1/controllers/integration/helpers/convert-country-code-to-id', () => () => 826);
jest.mock('../../../src/v1/controllers/integration/helpers/convert-currency-code-to-id', () => () => 12);

describe('PUT /v1/deals/:id/status - to `Submitted` - issued/unconditional facility submission details', () => {
  let aBarclaysMaker;
  let aSuperuser;
  let updatedDeal;
  let completedDealWithFacilities;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    const barclaysMakers = testUsers().withRole('maker').withBankName('Barclays Bank').all();
    aBarclaysMaker = barclaysMakers[0];
    aBarclaysChecker = testUsers().withRole('checker').withBankName('Barclays Bank').one();
    aSuperuser = testUsers().superuser().one();
  });

  describe('when a deal status changes to `Submitted`', () => {
    let updatedDeal;
    let dealId;

    const mockUnsubmittedUnconditionalLoan = (id) => ({
      _id: id,
      facilityStage: 'Unconditional',
      ukefGuaranteeInMonths: '12',
      bankReferenceNumber: '123456',
      guaranteeFeePayableByBank: '10.8000',
      ukefExposure: '2,469,135.60',
      facilityValue: '12345678',
      currencySameAsSupplyContractCurrency: 'false',
      interestMarginFee: '12',
      coveredPercentage: '20',
      minimumQuarterlyFee: '20',
      premiumFrequency: 'Monthly',
      premiumType: 'In advance',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: 'GBP',
      },
      conversionRate: '80',
      'conversionRateDate-day': `${moment().subtract(1, 'day').format('DD')}`,
      'conversionRateDate-month': `${moment().subtract(1, 'day').format('MM')}`,
      'conversionRateDate-year': `${moment().format('YYYY')}`,
      disbursementAmount: '10',
      'coverEndDate-day': `${moment().add(1, 'month').format('DD')}`,
      'coverEndDate-month': `${moment().add(1, 'month').format('MM')}`,
      'coverEndDate-year': `${moment().add(1, 'month').format('YYYY')}`,
    });
    
    const mockUnsubmittedUnconditionalLoanWithIssueFacilityDetails = (id) => ({
      ...mockUnsubmittedUnconditionalLoan(id),
      previousFacilityStage: 'Conditional',
      issuedDate: moment().utc().valueOf(),
      issueFacilityDetailsStarted: true,
      issueFacilityDetailsProvided: true,
      status: 'Ready for check',
    });

    const unsubmittedIssuedBond = (id) => ({
      _id: id,
      bondIssuer: 'issuer',
      bondType: 'Retention bond',
      facilityStage: 'Issued',
      ukefGuaranteeInMonths: '24',
      uniqueIdentificationNumber: '1234',
      bondBeneficiary: 'test',
      facilityValue: '123456.55',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '9.09',
      coveredPercentage: '2',
      feeType: 'In arrear',
      feeFrequency: 'Monthly',
      dayCountBasis: '360',
      guaranteeFeePayableByBank: '12.345',
      ukefExposure: '1,234.56',
      'coverEndDate-day': `${moment().add(1, 'month').format('DD')}`,
      'coverEndDate-month': `${moment().add(1, 'month').format('MM')}`,
      'coverEndDate-year': `${moment().add(1, 'month').format('YYYY')}`,
      uniqueIdentificationNumber: '1234567890',
    });

    const unsubmittedIssuedBondWithIssueFacilityDetails = (id) => ({
      ...unsubmittedIssuedBond(id),
      previousFacilityStage: 'Unissued',
      issuedDate: moment().utc().valueOf(),
      issueFacilityDetailsStarted: true,
      issueFacilityDetailsProvided: true,
      status: 'Ready for check',
    });

    beforeEach(async () => {
      completedDealWithFacilities = {
        ...completedDeal,
        loanTransactions: {
          items: [
            mockUnsubmittedUnconditionalLoan('1'),
            mockUnsubmittedUnconditionalLoan('2'),
            mockUnsubmittedUnconditionalLoanWithIssueFacilityDetails('3'),
            mockUnsubmittedUnconditionalLoanWithIssueFacilityDetails('4'),
          ],
        },
        bondTransactions: {
          items: [
            unsubmittedIssuedBond('1'),
            unsubmittedIssuedBond('2'),
            unsubmittedIssuedBondWithIssueFacilityDetails('3'),
            unsubmittedIssuedBondWithIssueFacilityDetails('4'),
          ],
        },
      };

      const postResult = await as(aBarclaysMaker).post(JSON.parse(JSON.stringify(completedDealWithFacilities))).to('/v1/deals');

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${postResult.body._id}/status`);
      dealId = updatedDeal.body._id;
    });

    describe('any Unconditional loans that do NOT have issueFacilityDetailsSubmitted', () => {
      it('should add issueFacilityDetailsSubmitted, submitted timestamp, submitted by and `Completed` status', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);
        const deal = body.deal;

        // NOTE: aka - unconditional loans created from Deal Draft, did not need to complete Issue Facility Form
        const originalDeal = {
          unsubmittedUnconditionalLoansNotProvidedIssueFacilityDetails: completedDealWithFacilities.loanTransactions.items.filter((loan) =>
            !loan.issueFacilityDetailsSubmitted
            && !loan.issueFacilityDetailsProvided),
        };

        const loansThatShouldBeUpdated = [];

        originalDeal.unsubmittedUnconditionalLoansNotProvidedIssueFacilityDetails.forEach((b) => {
          loansThatShouldBeUpdated.push(b._id);
        })

        // make sure we have some loans to test against
        expect(loansThatShouldBeUpdated.length > 0).toEqual(true);

        loansThatShouldBeUpdated.forEach((loanId) => {
          const updatedLoan = deal.loanTransactions.items.find((l) => l._id === loanId);

          expect(updatedLoan.issueFacilityDetailsSubmitted).toEqual(true);
          expect(typeof updatedLoan.issuedFacilitySubmittedToUkefTimestamp).toEqual('string');
          expect(updatedLoan.issuedFacilitySubmittedToUkefBy.username).toEqual(aBarclaysChecker.username);
          expect(updatedLoan.issuedFacilitySubmittedToUkefBy.email).toEqual(aBarclaysChecker.email);
          expect(updatedLoan.issuedFacilitySubmittedToUkefBy.firstname).toEqual(aBarclaysChecker.firstname);
          expect(updatedLoan.issuedFacilitySubmittedToUkefBy.lastname).toEqual(aBarclaysChecker.lastname);
          expect(updatedLoan.status).toEqual('Completed');
        });
      });
    });

    describe('any Issued bonds that do NOT have issueFacilityDetailsSubmitted', () => {
      it('should add issueFacilityDetailsSubmitted, submitted timestamp, submitted by and `Completed` status', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);
        const deal = body.deal;

        // NOTE: aka - issued bonds created from Deal Draft, did not need to complete Issue Facility Form
        const originalDeal = {
          unsubmittedIssuedBondsNotProvidedIssueFacilityDetails: completedDealWithFacilities.bondTransactions.items.filter((bond) =>
            !bond.issueFacilityDetailsSubmitted
            && !bond.issueFacilityDetailsProvided),
        };

        const bondsThatShouldBeUpdated = [];

        originalDeal.unsubmittedIssuedBondsNotProvidedIssueFacilityDetails.forEach((b) => {
          bondsThatShouldBeUpdated.push(b._id);
        })

        // make sure we have some bonds to test against
        expect(bondsThatShouldBeUpdated.length > 0).toEqual(true);

        bondsThatShouldBeUpdated.forEach((bondId) => {
          const updatedBond = deal.bondTransactions.items.find((b) => b._id === bondId);

          expect(updatedBond.issueFacilityDetailsSubmitted).toEqual(true);
          expect(typeof updatedBond.issuedFacilitySubmittedToUkefTimestamp).toEqual('string');
          expect(updatedBond.issuedFacilitySubmittedToUkefBy.username).toEqual(aBarclaysChecker.username);
          expect(updatedBond.issuedFacilitySubmittedToUkefBy.email).toEqual(aBarclaysChecker.email);
          expect(updatedBond.issuedFacilitySubmittedToUkefBy.firstname).toEqual(aBarclaysChecker.firstname);
          expect(updatedBond.issuedFacilitySubmittedToUkefBy.lastname).toEqual(aBarclaysChecker.lastname);
          expect(updatedBond.status).toEqual('Completed');
        });
      });
    });

    describe('any Unconditional loans that do NOT have issueFacilityDetailsSubmitted, but have issueFacilityDetailsProvided and `ready for check` status', () => {
      it('should add `Submitted` status', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);
        const deal = body.deal;

        // NOTE: aka - unconditional loans created from Deal Draft, had to complete Issue Facility Form
        const originalDeal = {
          unsubmittedUnconditionalLoansProvidedIssueFacilityDetails: completedDealWithFacilities.loanTransactions.items.filter((loan) =>
            loan.issueFacilityDetailsProvided
            && loan.status === 'Ready for check'
            && !loan.issueFacilityDetailsSubmitted),
        };

        const loansThatShouldBeUpdated = [];

        originalDeal.unsubmittedUnconditionalLoansProvidedIssueFacilityDetails.forEach((b) => {
          loansThatShouldBeUpdated.push(b._id);
        })

        // make sure we have some loans to test against
        expect(loansThatShouldBeUpdated.length > 0).toEqual(true);

        loansThatShouldBeUpdated.forEach((loanId) => {
          const updatedLoan = deal.loanTransactions.items.find((l) => l._id === loanId);

          expect(updatedLoan.status).toEqual('Submitted');
        });
      });
    });

    describe('any Issued bonds that do NOT have issueFacilityDetailsSubmitted, but have issueFacilityDetailsProvided and `ready for check` status', () => {
      it('should add `Submitted` status', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);
        const deal = body.deal;

        // NOTE: aka - unconditional bonds created from Deal Draft, had to complete Issue Facility Form
        const originalDeal = {
          unsubmittedIssuedBondsProvidedIssueFacilityDetails: completedDealWithFacilities.bondTransactions.items.filter((bond) =>
            bond.issueFacilityDetailsProvided
            && bond.status === 'Ready for check'
            && !bond.issueFacilityDetailsSubmitted),
        };

        const bondsThatShouldBeUpdated = [];

        originalDeal.unsubmittedIssuedBondsProvidedIssueFacilityDetails.forEach((b) => {
          bondsThatShouldBeUpdated.push(b._id);
        })

        // make sure we have some bonds to test against
        expect(bondsThatShouldBeUpdated.length > 0).toEqual(true);

        bondsThatShouldBeUpdated.forEach((bondId) => {
          const updatedBond = deal.bondTransactions.items.find((l) => l._id === bondId);

          expect(updatedBond.status).toEqual('Submitted');
        });
      });
    });
  });
});
