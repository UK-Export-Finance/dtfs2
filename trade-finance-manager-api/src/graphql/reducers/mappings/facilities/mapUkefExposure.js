const { formattedNumber } = require('../../../../utils/number');

const mapUkefExposure = (facilityTfm) => {
  const {
    ukefExposure,
    ukefExposureCalculationTimestamp,
  } = facilityTfm;

  const formattedUkefExposure = formattedNumber(ukefExposure);

  return `GBP ${formattedUkefExposure} as at ${ukefExposureCalculationTimestamp}`;
};

module.exports = mapUkefExposure;
