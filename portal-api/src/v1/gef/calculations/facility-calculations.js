const {
  decimalsCount,
  roundNumber,
} = require('../../../utils/number');

const calculateUkefExposure = (requestedUpdate, existingFacility) => {
  let ukefExposure;

  let latestValue = (existingFacility && existingFacility.value);
  let latestCoverPercentage = (existingFacility && existingFacility.coverPercentage);

  // make sure we calculate with the latest values.
  if (requestedUpdate.value) {
    latestValue = requestedUpdate.value;
  }

  if (requestedUpdate.coverPercentage) {
    latestCoverPercentage = requestedUpdate.coverPercentage;
  }

  const calculation = Number(latestValue) * (Number(latestCoverPercentage) / 100);

  const totalDecimals = decimalsCount(calculation);

  if (totalDecimals > 2) {
    ukefExposure = roundNumber(calculation, 2);
  } else {
    ukefExposure = calculation;
  }

  return ukefExposure;
};
exports.calculateUkefExposure = calculateUkefExposure;

const calculateGuaranteeFee = (requestedUpdate, existingFacility) => {
  let latestInterestPercentage = (existingFacility && existingFacility.interestPercentage);

  // make sure we calculate with the latest values.
  if (requestedUpdate.interestPercentage) {
    latestInterestPercentage = requestedUpdate.interestPercentage;
  }

  const calculation = (0.9 * Number(latestInterestPercentage));

  const withLimitedDecimals = Number(calculation.toFixed(3));

  return withLimitedDecimals;
};
exports.calculateGuaranteeFee = calculateGuaranteeFee;
