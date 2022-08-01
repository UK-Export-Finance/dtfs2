const mapUkefExposure = require('./mapUkefExposure');
const mapPremiumSchedule = require('./mapPremiumSchedule');
const mapPremiumTotals = require('./mapPremiumTotals');

const mapFacilityTfm = async (facilityTfm, dealTfm, facility) =>
  ({
    ...facilityTfm,
    ukefExposure: await mapUkefExposure(facilityTfm, facility),
    premiumSchedule: mapPremiumSchedule(facilityTfm.premiumSchedule),
    premiumTotals: mapPremiumTotals(facilityTfm.premiumSchedule),
    creditRating: dealTfm.exporterCreditRating,
  });

module.exports = mapFacilityTfm;
