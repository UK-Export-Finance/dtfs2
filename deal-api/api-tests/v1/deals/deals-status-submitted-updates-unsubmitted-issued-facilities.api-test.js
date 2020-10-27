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

describe('PUT /v1/deals/:id/status - from `Accepted by UKEF` - facility cover start dates', () => {
  let aBarclaysMaker;
  let aSuperuser;
  let submittedMinDeal;
  let updatedDeal;

  const isUnsubmittedIssuedFacility = (facility) => {
    if ((facility.facilityStage === 'Unissued' || facility.facilityStage === 'Conditional')
      && facility.issueFacilityDetailsProvided
      && !facility.issueFacilityDetailsSubmitted
      && facility.status !== 'Submitted') {
      return facility;
    }
    return null;
  };

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

    const loanReadyForCheck = (id) => ({
      _id: id,
      facilityStage: 'Unconditional',
      previousFacilityStage: 'Conditional',
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
      issuedDate: moment().utc().valueOf(),
      'coverEndDate-day': `${moment().add(1, 'month').format('DD')}`,
      'coverEndDate-month': `${moment().add(1, 'month').format('MM')}`,
      'coverEndDate-year': `${moment().add(1, 'month').format('YYYY')}`,
      issueFacilityDetailsStarted: true,
      issueFacilityDetailsProvided: true,
      status: 'Ready for check',
    });

    const bondReadyForCheck = (id) => ({
      _id: id,
      bondIssuer: 'issuer',
      bondType: 'Retention bond',
      facilityStage: 'Issued',
      previousFacilityStage: 'Unissued',
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
      issuedDate: moment().utc().valueOf(),
      'coverEndDate-day': `${moment().add(1, 'month').format('DD')}`,
      'coverEndDate-month': `${moment().add(1, 'month').format('MM')}`,
      'coverEndDate-year': `${moment().add(1, 'month').format('YYYY')}`,
      uniqueIdentificationNumber: '1234567890',
      issueFacilityDetailsProvided: true,
      status: 'Ready for check',
    });

    beforeEach(async () => {
      const completedDealWithReadyForCheckFacilities = {
        ...completedDeal,
        loanTransactions: {
          items: [
            loanReadyForCheck('1234'),
            loanReadyForCheck('5678'),
          ],
        },
        bondTransactions: {
          items: [
            bondReadyForCheck('1234'),
            bondReadyForCheck('5678'),
          ],
        },
      };

      const postResult = await as(aBarclaysMaker).post(JSON.parse(JSON.stringify(completedDealWithReadyForCheckFacilities))).to('/v1/deals');

      const statusUpdate = {
        status: 'Submitted',
        confirmSubmit: true,
      };

      updatedDeal = await as(aBarclaysChecker).put(statusUpdate).to(`/v1/deals/${postResult.body._id}/status`);
      dealId = updatedDeal.body._id;
    });

    describe('any Unconditional loans that have issueFacilityDetailsProvided, `Ready for check` status and NOT issueFacilityDetailsSubmitted', () => {
      it('should change status to `Submitted`, add issueFacilityDetailsSubmitted, submitted timestamp and submitted by', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);
        const deal = body.deal;

        deal.loanTransactions.items.forEach((loan) => {
          expect(loan.issueFacilityDetailsSubmitted).toEqual(true);
          expect(loan.status).toEqual('Submitted');
          expect(typeof loan.issuedFacilitySubmittedToUkefTimestamp).toEqual('string');
          expect(loan.issuedFacilitySubmittedToUkefBy.username).toEqual(aBarclaysChecker.username);
          expect(loan.issuedFacilitySubmittedToUkefBy.email).toEqual(aBarclaysChecker.email);
          expect(loan.issuedFacilitySubmittedToUkefBy.firstname).toEqual(aBarclaysChecker.firstname);
          expect(loan.issuedFacilitySubmittedToUkefBy.lastname).toEqual(aBarclaysChecker.lastname);
        });
      });
    });

    describe('any Issued bonds that have issueFacilityDetailsProvided, `Ready for check` status and NOT issueFacilityDetailsSubmitted', () => {
      it('should change status to `Submitted`, add issueFacilityDetailsSubmitted, submitted timestamp and submitted by', async () => {
        expect(updatedDeal.status).toEqual(200);
        expect(updatedDeal.body).toBeDefined();

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}`);
        const deal = body.deal;

        deal.bondTransactions.items.forEach((bond) => {
          expect(bond.issueFacilityDetailsSubmitted).toEqual(true);
          expect(bond.status).toEqual('Submitted');
          expect(typeof bond.issuedFacilitySubmittedToUkefTimestamp).toEqual('string');
          expect(bond.issuedFacilitySubmittedToUkefBy.username).toEqual(aBarclaysChecker.username);
          expect(bond.issuedFacilitySubmittedToUkefBy.email).toEqual(aBarclaysChecker.email);
          expect(bond.issuedFacilitySubmittedToUkefBy.firstname).toEqual(aBarclaysChecker.firstname);
          expect(bond.issuedFacilitySubmittedToUkefBy.lastname).toEqual(aBarclaysChecker.lastname);
        });
      });
    });
  });
});
