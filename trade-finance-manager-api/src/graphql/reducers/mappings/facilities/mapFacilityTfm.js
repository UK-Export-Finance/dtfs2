const mapUkefExposure = require('./mapUkefExposure');

const mapFacilityTfm = (facilityTfm) => ({
  ...facilityTfm,
  ukefExposure: mapUkefExposure(facilityTfm),
});

module.exports = mapFacilityTfm;
