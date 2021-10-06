const calculateUkefExposure = (requestedUpdate, existingFacility) => {
  let latestValue = (existingFacility && existingFacility.value);
  let latestCoverPercentage = (existingFacility && existingFacility.coverPercentage);

  // make sure we calculate with the latest values.
  if (requestedUpdate.value) {
    latestValue = requestedUpdate.value;
  }

  if (requestedUpdate.coverPercentage) {
    latestCoverPercentage = requestedUpdate.coverPercentage;
  }

  const calculation = (latestValue * latestCoverPercentage);

  return calculation;
};
exports.calculateUkefExposure = calculateUkefExposure;

const calculateGuaranteeFee = (requestedUpdate, existingFacility) => {
  let latestInterestPercentage = (existingFacility && existingFacility.interestPercentage);

  // make sure we calculate with the latest values.
  if (requestedUpdate.interestPercentage) {
    latestInterestPercentage = requestedUpdate.interestPercentage;
  }

  const calculation = (0.9 * latestInterestPercentage);

  return calculation;
};
exports.calculateGuaranteeFee = calculateGuaranteeFee;
