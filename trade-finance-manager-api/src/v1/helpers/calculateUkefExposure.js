const { getNowAsEpochMillisecondString } = require('../../utils/date');
const { decimalsCount, roundNumber } = require('./number');

const calculateUkefExposure = (facilityValueInGBP, coverPercentage) => {
  let ukefExposure;

  const calculation = facilityValueInGBP * (coverPercentage / 100);
  const totalDecimals = decimalsCount(calculation);

  if (totalDecimals > 2) {
    ukefExposure = roundNumber(calculation, 2);
  } else {
    ukefExposure = calculation;
  }

  return {
    ukefExposure,
    ukefExposureCalculationTimestamp: getNowAsEpochMillisecondString(),
  };
};

module.exports = calculateUkefExposure;
