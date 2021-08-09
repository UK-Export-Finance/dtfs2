const CONSTANTS = require('../../constants');

const isFacilityValidForPremiumSchedule = (
  facility,
  facilityExposurePeriod,
  facilityGuaranteeDates,
) => {
  if (!facilityExposurePeriod || facilityExposurePeriod < 1) {
    return false;
  }
  if (facility.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
    if (!facility.feeType) {
      return false;
    }
  } else if (!facility.premiumType) {
    return false;
  }
  if (!facility.ukefFacilityID) {
    return false;
  }
  if (!facilityGuaranteeDates.guaranteeCommencementDate) {
    return false;
  }
  if (!facilityGuaranteeDates.guaranteeExpiryDate) {
    return false;
  }
  if (!facility.guaranteeFeePayableByBank) {
    return false;
  }
  if (!facility.coverPercentage) {
    return false;
  }

  if (!facility.dayCountBasis) {
    return false;
  }

  if (!facility.ukefExposure) {
    return false;
  }

  return true;
};

module.exports = isFacilityValidForPremiumSchedule;
