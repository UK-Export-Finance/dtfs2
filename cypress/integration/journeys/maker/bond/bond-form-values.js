const moment = require('moment');

const date = moment();
const requestedCoverStartDate = date;
const coverEndDate = moment(date).add(1, 'months');

const DETAILS = {
  bondIssuer: 'mock issuer',
  bondType: {
    value: 'Maintenance bond',
    text: 'Maintenance bond',
  },

  // 'issued' bond stage specifics
  requestedCoverStartDateDay: moment(requestedCoverStartDate).format('DD'),
  requestedCoverStartDateMonth: moment(requestedCoverStartDate).format('MM'),
  requestedCoverStartDateYear: moment(requestedCoverStartDate).format('YYYY'),
  coverEndDateDay: moment(coverEndDate).format('DD'),
  coverEndDateMonth: moment(coverEndDate).format('MM'),
  coverEndDateYear: moment(coverEndDate).format('YYYY'),
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
  conversionRateDateDay: moment(date).format('DD'),
  conversionRateDateMonth: moment(date).format('MM'),
  conversionRateDateYear: moment(date).format('YYYY'),
};

module.exports = {
  DETAILS,
  FINANCIAL_DETAILS,
};
