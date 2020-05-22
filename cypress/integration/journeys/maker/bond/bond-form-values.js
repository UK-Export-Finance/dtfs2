// TODO: move to root utils directory
const {
  now,
  formatDate,
  addMonthsToDate,
} = require('../../../../../deal-api/src/v1/validation/date-field');

const date = now();
const requestedCoverStartDate = date;
const coverEndDate = addMonthsToDate(date, 1);

const DETAILS = {
  bondIssuer: 'mock issuer',
  bondType: {
    value: 'Maintenance bond',
    text: 'Maintenance bond',
  },

  // 'issued' bond stage specifics
  // TOD: dynamically generate
  requestedCoverStartDateDay: formatDate(requestedCoverStartDate, 'DD'),
  requestedCoverStartDateMonth: formatDate(requestedCoverStartDate, 'MM'),
  requestedCoverStartDateYear: formatDate(requestedCoverStartDate, 'YYYY'),
  coverEndDateDay: formatDate(coverEndDate, 'DD'),
  coverEndDateMonth: formatDate(coverEndDate, 'MM'),
  coverEndDateYear: formatDate(coverEndDate, 'YYYY'),
  uniqueIdentificationNumber: '123456',
  bondBeneficiary: 'mock beneficiary',

  // 'unissued' bond stage specifics
  ukefGuaranteeInMonths: '12',
};

const FINANCIAL_DETAILS = {
  bondValue: '123',
  riskMarginFee: '20',
  coveredPercentage: '80',
  minimumRiskMarginFee: '1.23',

  // 'transaction currency not the same as supply contract currency' specifics
  currency: {
    value: 'EUR',
    text: 'EUR - Euros',
  },
  conversionRate: '100',
  conversionRateDateDay: '01',
  conversionRateDateMonth: '02',
  conversionRateDateYear: '2020',
};

module.exports = {
  DETAILS,
  FINANCIAL_DETAILS,
};
