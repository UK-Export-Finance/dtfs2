const mapUkefExposure = require('./mapUkefExposure');
const mapPremiumSchedule = require('./mapPremiumSchedule');
const mapPremiumTotals = require('./mapPremiumTotals');

const mapFacilityTfm = (facilityTfm, dealTfm) =>
  ({
    ...facilityTfm,
    ukefExposure: mapUkefExposure(facilityTfm),
    premiumSchedule: mapPremiumSchedule(facilityTfm.premiumSchedule),
    premiumTotals: mapPremiumTotals(facilityTfm.premiumSchedule),
    creditRating: dealTfm.exporterCreditRating,
  });
module.exports = mapFacilityTfm;
