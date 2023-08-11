const { CURRENCY, FACILITIES } = require('../../constants');
const { findLatestCompletedAmendmentExposure } = require('../../graphql/helpers/amendment.helpers');
const { formattedNumber } = require('../../utils/number');

const isGefFacility = (type) =>
  type === FACILITIES.FACILITY_TYPE.CASH
    || type === FACILITIES.FACILITY_TYPE.CONTINGENT;

const mapFacilitySnapshot = () => {

};

const mapUkefExposure = (facilityTfm, facility) => {
  if (facilityTfm) {
    const { ukefExposure, ukefExposureCalculationTimestamp } = facilityTfm;

    const latestCompletedAmendmentExposure = findLatestCompletedAmendmentExposure(facility);
    const { exposure, timestamp } = latestCompletedAmendmentExposure
      ? latestCompletedAmendmentExposure.exposure
      : { exposure: formattedNumber(ukefExposure), timeStamp: ukefExposureCalculationTimestamp };

    return {
      exposure: `${CURRENCY.GBP} ${exposure}`,
      timestamp: `${timestamp}`,
    };
  }

  return {};
};

const mapPremiumSchedule = (premiumSchedules) => premiumSchedules.forEach(() => {
    
});

const mapFacilityTfm = (facility, dealTfm) => {
  const { tfm: facilityTfm } = facility;

  return {
    ...facilityTfm,
    ukefExposure: mapUkefExposure(facilityTfm, facility),
    premiumSchedule: facilityTfm.premiumSchedule ? mapPremiumSchedule(facilityTfm.premiumSchedule) : [],
    premiumTotals: 'string', // placeholder
    creditRating: dealTfm.exporterCreditRating
  };
};

const mapFacility = (facility, deal) => {
  const { facilitySnapshot } = facility;
  const { tfm: dealTfm } = deal;

  if (isGefFacility(facilitySnapshot.type)) {
    // gef specific logic for facilitySnapshot
  }

  const result = {
    _id: facility._id,
    facilitySnapshot: mapFacilitySnapshot(),
    tfm: mapFacilityTfm(facility, dealTfm),
  };

  return result;
};

module.exports = {
  mapFacility,
};
