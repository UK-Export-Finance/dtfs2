const { today, oneMonth } = require('../../../../../e2e-fixtures/dateConstants');

const nowDay = today.dayLong;
const nowMonth = today.monthLong;
const nowYear = today.year;

const nowPlusMonthDay = oneMonth.dayLong;
const nowPlusMonthMonth = oneMonth.monthLong;
const nowPlusMonthYear = oneMonth.year;

const GUARANTEE_DETAILS = {
  // 'Conditional' facility stage specifics
  ukefGuaranteeInMonths: '12',

  // 'Unconditional' facility stage specifics
  name: '123456',
  requestedCoverStartDateDay: nowDay,
  requestedCoverStartDateMonth: nowMonth,
  requestedCoverStartDateYear: nowYear,
  coverEndDateDay: nowPlusMonthDay,
  coverEndDateMonth: nowPlusMonthMonth,
  coverEndDateYear: nowPlusMonthYear,
};

const FINANCIAL_DETAILS = {
  value: '1234.00',
  valueFormatted: '1,234.00',
  currency: {
    value: 'EUR',
    text: 'EUR - Euros',
  },
  conversionRate: '100',
  conversionRateDateDay: nowDay,
  conversionRateDateMonth: nowMonth,
  conversionRateDateYear: nowYear,
  disbursementAmount: '10.00',
  interestMarginFee: '20',
  coveredPercentage: '5',
  minimumQuarterlyFee: '1',
};

module.exports = {
  GUARANTEE_DETAILS,
  FINANCIAL_DETAILS,
};
