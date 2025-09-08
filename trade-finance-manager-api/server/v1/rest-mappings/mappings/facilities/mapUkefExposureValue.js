const mapUkefExposure = require('./mapUkefExposure');

// returns exposure value from facility or amendment value
const mapUkefExposureValue = (facilityTfm, facility) => {
  const { exposure } = mapUkefExposure(facilityTfm, facility);

  return exposure;
};

module.exports = mapUkefExposureValue;
