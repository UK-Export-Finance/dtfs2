const { roundNumber } = require('../../../../../portal-api/src/utils/number');

const calculateExpectedGuaranteeFee = (marginFee) => {
  const calculation = marginFee * 0.9;
  const expected = calculation.toLocaleString('en', { minimumFractionDigits: 4 });
  return expected;
};

const calculateExpectedUkefExposure = (facilityValue, coveredPercentage) => {
  const strippedFacilityValue = facilityValue.replace(/,/g, '');

  const calculation = strippedFacilityValue * (coveredPercentage / 100);

  const ukefExposure = roundNumber(calculation, 2);
  const formattedUkefExposure = ukefExposure.toLocaleString('en', { minimumFractionDigits: 2 });
  return formattedUkefExposure;
};

module.exports = {
  calculateExpectedGuaranteeFee,
  calculateExpectedUkefExposure,
};
