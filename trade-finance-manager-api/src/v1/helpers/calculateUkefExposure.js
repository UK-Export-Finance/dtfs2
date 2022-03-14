const now = require('../../now');
const {
  decimalsCount,
  roundNumber,
} = require('./number');

const calculateUkefExposure = (valueInGBP, coverPercentage) => {
  let ukefExposure;

  const calculation = valueInGBP * (coverPercentage / 100);
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
