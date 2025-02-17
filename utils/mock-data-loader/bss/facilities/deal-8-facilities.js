const { CURRENCY } = require('@ukef/dtfs2-common');
const { nowTimestamp } = require('../dates');

module.exports = [
  {
    mockDealId: 8,
    type: 'Loan',
    ukefGuaranteeInMonths: '24',
    'coverEndDate-day': null,
    'coverEndDate-month': null,
    'coverEndDate-year': null,
    name: 'Test Loan 8',
    requestedCoverStartDate: null,
    disbursementAmount: null,
    value: '100000.00',
    currencySameAsSupplyContractCurrency: 'true',
    currency: {
      text: 'GBP - UK Sterling',
      id: CURRENCY.GBP,
      currencyId: 12,
    },
    conversionRate: null,
    'conversionRateDate-day': null,
    'conversionRateDate-month': null,
    'conversionRateDate-year': null,
    createdDate: nowTimestamp,

    facilityStage: 'Conditional',
    hasBeenIssued: false,
    'requestedCoverStartDate-day': null,
    'requestedCoverStartDate-month': null,
    'requestedCoverStartDate-year': null,
    ukefExposure: '60,000.00',
    updatedAt: nowTimestamp,
    interestMarginFee: '2',
    coveredPercentage: '60',
    minimumQuarterlyFee: '',
    guaranteeFeePayableByBank: '1.8000',
    premiumFrequency: 'Monthly',
    premiumType: 'In advance',
    dayCountBasis: '365',
    viewedPreviewPage: true,
  },
];
