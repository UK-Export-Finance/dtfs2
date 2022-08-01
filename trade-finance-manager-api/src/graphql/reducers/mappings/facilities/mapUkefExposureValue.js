const mapUkefExposure = require('./mapUkefExposure');

// returns exposure value from facility or amendment value
const mapUkefExposureValue = async (facilityTfm, facility) => {
  const { exposure } = await mapUkefExposure(facilityTfm, facility);

  return exposure;
};

module.exports = mapUkefExposureValue;
