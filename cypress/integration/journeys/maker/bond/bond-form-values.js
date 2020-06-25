const moment = require('moment');
const { roundNumber } = require('../../../../../deal-api/src/utils/number');

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

const riskMarginFee = '20';

const expectedGuaranteeFeePayableByBank = () => {
  const calculation = riskMarginFee * 0.9;
  const formattedRiskMarginFee = calculation.toLocaleString('en', { minimumFractionDigits: 4 });
  return formattedRiskMarginFee;
};

const facilityValue = '23,456,789.99';
const coveredPercentage = '80';

const expectedUkefExposure = () => {
  const strippedFacilityValue = facilityValue.replace(/,/g, '');

  const calculation = strippedFacilityValue * (coveredPercentage / 100);

  const ukefExposure = roundNumber(calculation, 2);
  const formattedUkefExposure = ukefExposure.toLocaleString('en', { minimumFractionDigits: 2 });
  return formattedUkefExposure;
};

const FINANCIAL_DETAILS = {
  facilityValue,
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
  conversionRateDateDay: moment(date).format('DD'),
  conversionRateDateMonth: moment(date).format('MM'),
  conversionRateDateYear: moment(date).format('YYYY'),
};

module.exports = {
  DETAILS,
  FINANCIAL_DETAILS,
};
