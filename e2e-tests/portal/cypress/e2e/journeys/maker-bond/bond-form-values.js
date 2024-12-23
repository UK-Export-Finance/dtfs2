const { BOND_TYPE } = require('@ukef/dtfs2-common');
const { roundNumber } = require('../../../../../../portal-api/src/utils/number');
const { oneMonth, today } = require('../../../../../e2e-fixtures/dateConstants');

const DETAILS = {
  bondIssuer: 'mock issuer',
  bondType: {
    value: BOND_TYPE.MAINTENANCE_BOND,
    text: BOND_TYPE.MAINTENANCE_BOND,
  },
  // 'issued' facility stage specifics
  requestedCoverStartDateDay: today.dayLong,
  requestedCoverStartDateMonth: today.monthLong,
  requestedCoverStartDateYear: today.year,
  coverEndDateDay: oneMonth.dayLong,
  coverEndDateMonth: oneMonth.monthLong,
  coverEndDateYear: oneMonth.year,
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
  conversionRateDateDay: today.dayLong,
  conversionRateDateMonth: today.monthLong,
  conversionRateDateYear: today.year,
};

module.exports = {
  DETAILS,
  FINANCIAL_DETAILS,
};
