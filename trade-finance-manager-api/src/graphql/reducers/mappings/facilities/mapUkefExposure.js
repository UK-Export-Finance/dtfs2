const { formattedNumber } = require('../../../../utils/number');

const mapUkefExposure = (facilityTfm) => {
  const {
    ukefExposure,
    ukefExposureCalculationTimestamp,
  } = facilityTfm;

  const formattedUkefExposure = formattedNumber(ukefExposure);

  return {
    exposure: `GBP ${formattedUkefExposure}`,
    timestamp: `${ukefExposureCalculationTimestamp}`,
  };
};

module.exports = mapUkefExposure;
