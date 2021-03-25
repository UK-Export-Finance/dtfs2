const mapUkefExposure = require('./mapUkefExposure');

const mapFacilityTfm = (facilityTfm, dealTfm) => ({
  ...facilityTfm,
  ukefExposure: mapUkefExposure(facilityTfm),
  creditRating: dealTfm.exporterCreditRating,
});

module.exports = mapFacilityTfm;
