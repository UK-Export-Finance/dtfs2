const { oneMonth, today } = require('../../../../../e2e-fixtures/dateConstants');

const GUARANTEE_DETAILS = {
  // 'Conditional' facility stage specifics
  ukefGuaranteeInMonths: '12',

  // 'Unconditional' facility stage specifics
  name: '123456',
  requestedCoverStartDateDay: today.dayLong,
  requestedCoverStartDateMonth: today.monthLong,
  requestedCoverStartDateYear: today.year,
  coverEndDateDay: oneMonth.day,
  coverEndDateMonth: oneMonth.month,
  coverEndDateYear: oneMonth.year,
};

const FINANCIAL_DETAILS = {
  value: '1234.00',
  valueFormatted: '1,234.00',
  currency: {
    value: 'EUR',
    text: 'EUR - Euros',
  },
  conversionRate: '100',
  conversionRateDateDay: today.dayLong,
  conversionRateDateMonth: today.monthLong,
  conversionRateDateYear: today.year,
  disbursementAmount: '10.00',
  interestMarginFee: '20',
  coveredPercentage: '5',
  minimumQuarterlyFee: '1',
};

module.exports = {
  GUARANTEE_DETAILS,
  FINANCIAL_DETAILS,
};
