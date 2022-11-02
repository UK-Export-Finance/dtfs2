const { roundNumber } = require('../../../../../../../portal-api/src/utils/number');
const dateConstants = require('../../../../../../e2e-fixtures/dateConstants');

const DETAILS = {
  bondIssuer: 'mock issuer',
  bondType: {
    value: 'Maintenance bond',
    text: 'Maintenance bond',
  },

  // 'issued' facility stage specifics
  requestedCoverStartDateDay: (dateConstants.todayDay).toString(),
  requestedCoverStartDateMonth: (dateConstants.todayMonth).toString(),
  requestedCoverStartDateYear: (dateConstants.todayYear).toString(),
  coverEndDateDay: (dateConstants.oneMonthDay).toString(),
  coverEndDateMonth: (dateConstants.oneMonthMonth).toString(),
  coverEndDateYear: (dateConstants.oneMonthYear).toString(),
  name: '123456',
  bondBeneficiary: 'mock beneficiary',

  // 'unissued' facility stage specifics
  ukefGuaranteeInMonths: '12',
};

const riskMarginFee = '20';

const expectedGuaranteeFeePayableByBank = () => {
  const calculation = riskMarginFee * 0.9;
  const formattedRiskMarginFee = calculation.toLocaleString('en', { minimumFractionDigits: 4 });
  return formattedRiskMarginFee;
};

const value = '23456789.99';
const valueFormatted = '23,456,789.99';
const coveredPercentage = '80';

const expectedUkefExposure = () => {
  const strippedFacilityValue = value.replace(/,/g, '');

  const calculation = strippedFacilityValue * (coveredPercentage / 100);

  const ukefExposure = roundNumber(calculation, 2);
  const formattedUkefExposure = ukefExposure.toLocaleString('en', { minimumFractionDigits: 2 });
  return formattedUkefExposure;
};

const FINANCIAL_DETAILS = {
  value,
  valueFormatted,
  riskMarginFee,
  coveredPercentage,
  minimumRiskMarginFee: '1.23',
  ukefExposure: expectedUkefExposure(),
  guaranteeFeePayableByBank: expectedGuaranteeFeePayableByBank(),

  // 'transaction currency not the same as supply contract currency' specifics
  currency: {
    value: 'EUR',
    text: 'EUR - Euros',
  },
  conversionRate: '100',
  conversionRateDateDay: (dateConstants.todayDay).toString(),
  conversionRateDateMonth: (dateConstants.todayMonth).toString(),
  conversionRateDateYear: (dateConstants.todayYear).toString(),
};

module.exports = {
  DETAILS,
  FINANCIAL_DETAILS,
};
