const mapUkefExposure = require('./mapUkefExposure');
const mapPremiumSchedule = require('./mapPremiumSchedule');
const mapPremiumTotals = require('./mapPremiumTotals');

/**
 * Maps the facility tfm object from the database to one containing modified fields for use in TFM-UI and TFM-API.
 * @param {import('@ukef/dtfs2-common').FacilityTfmObject} facilityTfm
 * @param {import('@ukef/dtfs2-common').DealTfmObject} dealTfm
 * @param {import('@ukef/dtfs2-common').TfmFacility} facility
 * @returns {import('@ukef/dtfs2-common').MappedFacilityTfm} The mapped tfm object to be used across TFM-UI and TFM-API.
 */
const mapFacilityTfm = (facilityTfm, dealTfm, facility) => ({
  ...facilityTfm,
  ukefExposure: mapUkefExposure(facilityTfm, facility),
  premiumSchedule: mapPremiumSchedule(facilityTfm?.premiumSchedule),
  premiumTotals: mapPremiumTotals(facilityTfm?.premiumSchedule),
  creditRating: dealTfm.exporterCreditRating,
});

module.exports = mapFacilityTfm;
