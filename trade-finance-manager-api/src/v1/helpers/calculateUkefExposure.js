const now = require('../../now');
const {
  decimalsCount,
  roundNumber,
} = require('./number');

const calculateUkefExposure = (facilityValueInGBP, coveredPercentage) => {
  let ukefExposure;

  const calculation = facilityValueInGBP * (coveredPercentage / 100);
  const totalDecimals = decimalsCount(calculation);

  if (totalDecimals > 2) {
    ukefExposure = roundNumber(calculation, 2);
  } else {
    ukefExposure = calculation;
  }

  return {
    ukefExposure,
    ukefExposureCalculationTimestamp: now(),
  };
};

module.exports = calculateUkefExposure;
