const mapUkefExposure = require('./mapUkefExposure');

const mapFacilityTfm = (facilityTfm, dealTfm) =>
  ({
    ...facilityTfm,
    ukefExposure: mapUkefExposure(facilityTfm),
    premiumSchedule: facilityTfm.premiumSchedule,
    creditRating: dealTfm.exporterCreditRating,
  });
module.exports = mapFacilityTfm;
