const isFacilityValidForPremiumSchedule = (facility, facilityExposurePeriod, facilityGuaranteeDates) => {
  if (!facilityExposurePeriod || facilityExposurePeriod < 1) {
    return false;
  }
  if (!facility.feeType) {
    return false;
  }
  if (!facility.ukefFacilityId) {
    return false;
  }
  if (!facilityGuaranteeDates.guaranteeCommencementDate) {
    return false;
  }
  if (!facilityGuaranteeDates.guaranteeExpiryDate) {
    return false;
  }
  if (!facility.guaranteeFee) {
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
