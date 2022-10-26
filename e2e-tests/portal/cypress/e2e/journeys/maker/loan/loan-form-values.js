const { padDate, nowPlusMonths } = require('../../../../support/utils/dateFuncs');

const now = new Date();
const nowPlusMonth = nowPlusMonths(1);

const GUARANTEE_DETAILS = {
  // 'Conditional' facility stage specifics
  ukefGuaranteeInMonths: '12',

  // 'Unconditional' facility stage specifics
  name: '123456',
  requestedCoverStartDateDay: padDate(now.getDate()),
  requestedCoverStartDateMonth: padDate(now.getMonth() + 1),
  requestedCoverStartDateYear: now.getFullYear(),
  coverEndDateDay: padDate(nowPlusMonth.getDate()),
  coverEndDateMonth: padDate(nowPlusMonth.getMonth() + 1),
  coverEndDateYear: nowPlusMonth.getFullYear(),
};

const FINANCIAL_DETAILS = {
  value: '1234.00',
  valueFormatted: '1,234.00',
  currency: {
    value: 'EUR',
    text: 'EUR - Euros',
  },
  conversionRate: '100',
  conversionRateDateDay: padDate(now.getDate()),
  conversionRateDateMonth: padDate(now.getMonth() + 1),
  conversionRateDateYear: now.getFullYear(),
  disbursementAmount: '10.00',
  interestMarginFee: '20',
  coveredPercentage: '5',
  minimumQuarterlyFee: '1',
};

module.exports = {
  GUARANTEE_DETAILS,
  FINANCIAL_DETAILS,
};
