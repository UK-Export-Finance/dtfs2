const { BOND_TYPE } = require('@ukef/dtfs2-common');
const { sub, add, format } = require('date-fns');
const { CURRENCY } = require('@ukef/dtfs2-common');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const completedDeal = require('../../fixtures/deal-fully-completed-issued-and-unissued-facilities');

const { as } = require('../../api')(app);
const createFacilities = require('../../createFacilities');
const api = require('../../../src/v1/api');
const { MAKER, CHECKER } = require('../../../src/v1/roles/roles');

describe('PUT /v1/deals/:id/status - to `Submitted` - issued/unconditional facility submission details', () => {
  let aBarclaysMaker;
  let aBarclaysChecker;
  let aSuperuser;
  let updatedDeal;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    const barclaysMakers = testUsers().withRole(MAKER).withBankName('Barclays Bank').all();
    [aBarclaysMaker] = barclaysMakers;
    aBarclaysChecker = testUsers().withRole(CHECKER).withBankName('Barclays Bank').one();
    aSuperuser = testUsers().superuser().one();
  });

  describe('when a deal status changes to `Submitted`', () => {
    let dealId;
    let originalFacilities;

    const nowDate = new Date();
    const yesterday = sub(nowDate, { days: 1 });
    const nowPlusOneMonth = add(nowDate, { months: 1 });

    const mockUnsubmittedUnconditionalLoan = () => ({
      type: 'Loan',
      facilityStage: 'Unconditional',
      hasBeenIssued: true,
      ukefGuaranteeInMonths: '12',
      name: '123456',
      guaranteeFeePayableByBank: '10.8000',
      ukefExposure: '2,469,135.60',
      value: '12345678',
      currencySameAsSupplyContractCurrency: 'false',
      interestMarginFee: '12',
      coveredPercentage: '20',
      minimumQuarterlyFee: '20',
      premiumFrequency: 'Monthly',
      premiumType: 'In advance',
      dayCountBasis: '365',
      currency: {
        text: 'GBP - UK Sterling',
        id: CURRENCY.GBP,
      },
      conversionRate: '80',
      'conversionRateDate-day': format(yesterday, 'dd'),
      'conversionRateDate-month': format(yesterday, 'MM'),
      'conversionRateDate-year': format(yesterday, 'yyyy'),
      disbursementAmount: '10',
      'coverEndDate-day': format(nowPlusOneMonth, 'dd'),
      'coverEndDate-month': format(nowPlusOneMonth, 'MM'),
      'coverEndDate-year': format(nowPlusOneMonth, 'yyyy'),
    });

    const mockUnsubmittedUnconditionalLoanWithIssueFacilityDetails = () => ({
      ...mockUnsubmittedUnconditionalLoan(),
      previousFacilityStage: 'Conditional',
      issuedDate: nowDate.valueOf(),
      issueFacilityDetailsStarted: true,
      issueFacilityDetailsProvided: true,
      status: 'Ready for check',
    });

    const unsubmittedIssuedBond = () => ({
      type: 'Bond',
      bondIssuer: 'issuer',
      bondType: BOND_TYPE.RETENTION_BOND,
      facilityStage: 'Issued',
      hasBeenIssued: true,
      ukefGuaranteeInMonths: '24',
      name: '1234',
      bondBeneficiary: 'test',
      value: '123456.55',
      currencySameAsSupplyContractCurrency: 'true',
      riskMarginFee: '9.09',
      coveredPercentage: '2',
      feeType: 'In arrear',
      feeFrequency: 'Monthly',
      dayCountBasis: '360',
      guaranteeFeePayableByBank: '12.345',
      ukefExposure: '1,234.56',
      'coverEndDate-day': format(nowPlusOneMonth, 'dd'),
      'coverEndDate-month': format(nowPlusOneMonth, 'MM'),
      'coverEndDate-year': format(nowPlusOneMonth, 'yyyy'),
    });

    const unsubmittedIssuedBondWithIssueFacilityDetails = () => ({
      ...unsubmittedIssuedBond(),
      previousFacilityStage: 'Unissued',
      issuedDate: nowDate.valueOf(),
      issueFacilityDetailsStarted: true,
      issueFacilityDetailsProvided: true,
      status: 'Ready for check',
    });

    beforeEach(async () => {
      originalFacilities = [
        mockUnsubmittedUnconditionalLoan('1'),
        mockUnsubmittedUnconditionalLoan('2'),
        mockUnsubmittedUnconditionalLoanWithIssueFacilityDetails('3'),
        mockUnsubmittedUnconditionalLoanWithIssueFacilityDetails('4'),
        unsubmittedIssuedBond('1'),
        unsubmittedIssuedBond('2'),
        unsubmittedIssuedBondWithIssueFacilityDetails('3'),
        unsubmittedIssuedBondWithIssueFacilityDetails('4'),
      ];

      const postResult = await as(aBarclaysMaker)
        .post(JSON.parse(JSON.stringify(completedDeal)))
        .to('/v1/deals');

      dealId = postResult.body._id;

      api.tfmDealSubmit = () => Promise.resolve();

      const createdFacilities = await createFacilities(aBarclaysMaker, dealId, originalFacilities);
      completedDeal.mockFacilities = createdFacilities;

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${dealId}/status`);
    });

    describe('any Unconditional loans that do NOT have issueFacilityDetailsSubmitted', () => {
      it('should add issueFacilityDetailsSubmitted, submitted timestamp, submitted by and `Completed` status', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);
        const { deal } = body;

        // NOTE: aka - unconditional loans created from Deal Draft, did not need to complete Issue Facility Form
        const unsubmittedUnconditionalLoansNotProvidedIssueFacilityDetails = completedDeal.mockFacilities.filter(
          (facility) => facility.type === 'Loan' && !facility.issueFacilityDetailsSubmitted && !facility.issueFacilityDetailsProvided,
        );

        const loansThatShouldBeUpdated = unsubmittedUnconditionalLoansNotProvidedIssueFacilityDetails;

        // make sure we have some loans to test against
        expect(loansThatShouldBeUpdated.length > 0).toEqual(true);

        loansThatShouldBeUpdated.forEach((loan) => {
          const updatedLoan = deal.loanTransactions.items.find((l) => l._id === loan._id);

          expect(updatedLoan.issueFacilityDetailsSubmitted).toEqual(true);
          expect(typeof updatedLoan.submittedAsIssuedDate).toEqual('number');
          expect(updatedLoan.submittedAsIssuedBy.username).toEqual(aBarclaysChecker.username);
          expect(updatedLoan.submittedAsIssuedBy.email).toEqual(aBarclaysChecker.email);
          expect(updatedLoan.submittedAsIssuedBy.firstname).toEqual(aBarclaysChecker.firstname);
          expect(updatedLoan.submittedAsIssuedBy.lastname).toEqual(aBarclaysChecker.lastname);
          expect(updatedLoan.status).toEqual('Completed');
        });
      });
    });

    describe('any Issued bonds that do NOT have issueFacilityDetailsSubmitted', () => {
      it('should add issueFacilityDetailsSubmitted, submitted timestamp, submitted by and `Completed` status', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);
        const { deal } = body;

        // NOTE: aka - issued bonds created from Deal Draft, did not need to complete Issue Facility Form
        const unsubmittedIssuedBondsNotProvidedIssueFacilityDetails = completedDeal.mockFacilities.filter(
          (facility) => facility.type === 'Bond' && !facility.issueFacilityDetailsSubmitted && !facility.issueFacilityDetailsProvided,
        );

        const bondsThatShouldBeUpdated = unsubmittedIssuedBondsNotProvidedIssueFacilityDetails;

        // make sure we have some bonds to test against
        expect(bondsThatShouldBeUpdated.length > 0).toEqual(true);

        bondsThatShouldBeUpdated.forEach((bond) => {
          const updatedBond = deal.bondTransactions.items.find((b) => b._id === bond._id);

          expect(updatedBond.issueFacilityDetailsSubmitted).toEqual(true);
          expect(typeof updatedBond.submittedAsIssuedDate).toEqual('number');
          expect(updatedBond.submittedAsIssuedBy.username).toEqual(aBarclaysChecker.username);
          expect(updatedBond.submittedAsIssuedBy.email).toEqual(aBarclaysChecker.email);
          expect(updatedBond.submittedAsIssuedBy.firstname).toEqual(aBarclaysChecker.firstname);
          expect(updatedBond.submittedAsIssuedBy.lastname).toEqual(aBarclaysChecker.lastname);
          expect(updatedBond.status).toEqual('Completed');
        });
      });
    });

    describe('any Unconditional loans that do NOT have issueFacilityDetailsSubmitted, but have issueFacilityDetailsProvided and `ready for check` status', () => {
      it('should add `Submitted` status', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);
        const { deal } = body;

        // NOTE: aka - unconditional loans created from Deal Draft, had to complete Issue Facility Form
        const unsubmittedUnconditionalLoansProvidedIssueFacilityDetails = completedDeal.mockFacilities.filter(
          (facility) =>
            facility.type === 'Loan' &&
            facility.issueFacilityDetailsProvided &&
            facility.status === 'Ready for check' &&
            !facility.issueFacilityDetailsSubmitted,
        );

        const loansThatShouldBeUpdated = unsubmittedUnconditionalLoansProvidedIssueFacilityDetails;

        // make sure we have some loans to test against
        expect(loansThatShouldBeUpdated.length > 0).toEqual(true);

        loansThatShouldBeUpdated.forEach((loan) => {
          const updatedLoan = deal.loanTransactions.items.find((l) => l._id === loan._id);

          expect(updatedLoan.status).toEqual('Submitted');
        });
      });
    });

    describe('any Issued bonds that do NOT have issueFacilityDetailsSubmitted, but have issueFacilityDetailsProvided and `ready for check` status', () => {
      it('should add `Submitted` status', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);
        const { deal } = body;

        // NOTE: aka - unconditional bonds created from Deal Draft, had to complete Issue Facility Form
        const unsubmittedIssuedBondsProvidedIssueFacilityDetails = completedDeal.mockFacilities.filter(
          (facility) =>
            facility.type === 'Bond' &&
            facility.issueFacilityDetailsProvided &&
            facility.status === 'Ready for check' &&
            !facility.issueFacilityDetailsSubmitted,
        );

        const bondsThatShouldBeUpdated = unsubmittedIssuedBondsProvidedIssueFacilityDetails;

        // make sure we have some bonds to test against
        expect(bondsThatShouldBeUpdated.length > 0).toEqual(true);

        bondsThatShouldBeUpdated.forEach((facility) => {
          const updatedBond = deal.bondTransactions.items.find((l) => l._id === facility._id);

          expect(updatedBond.status).toEqual('Submitted');
        });
      });
    });
  });
});
