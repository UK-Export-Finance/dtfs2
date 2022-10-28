const mapUkefExposure = require('./mapUkefExposure');
const mapPremiumSchedule = require('./mapPremiumSchedule');
const mapPremiumTotals = require('./mapPremiumTotals');

const mapFacilityTfm = (facilityTfm, dealTfm, facility) =>
  ({
    ...facilityTfm,
    ukefExposure: mapUkefExposure(facilityTfm, facility),
    premiumSchedule: facilityTfm.premiumSchedule ? mapPremiumSchedule(facilityTfm.premiumSchedule) : [],
    premiumTotals: facilityTfm.premiumSchedule ? mapPremiumTotals(facilityTfm.premiumSchedule) : [],
    creditRating: dealTfm.exporterCreditRating,
  });

module.exports = mapFacilityTfm;
