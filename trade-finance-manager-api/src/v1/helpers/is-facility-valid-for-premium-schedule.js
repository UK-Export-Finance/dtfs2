const isFacilityValidForPremiumSchedule = (
  facility,
  facilityExposurePeriod,
  facilityGuaranteeDates,
) => {
  if (!facility.facilitySnapshot) {
    facility.facilitySnapshot = {};
  }

  if (!facilityExposurePeriod || facilityExposurePeriod < 1) {
    return false;
  }

  if (!facility.feeType || !facility.facilitySnapshot.premiumType) {
    return false;
  }

  if (!facility.ukefFacilityId || !facility.facilitySnapshot.ukefFacilityId) {
    return false;
  }

  if (!facilityGuaranteeDates.guaranteeCommencementDate) {
    return false;
  }

  if (!facilityGuaranteeDates.guaranteeExpiryDate) {
    return false;
  }

  if (!facility.guaranteeFee || !facility.facilitySnapshot.guaranteeFeePayableByBank) {
    return false;
  }

  if (!facility.coverPercentage || !facility.facilitySnapshot.coveredPercentage) {
    return false;
  }

  if (!facility.dayCountBasis || !facility.facilitySnapshot.dayCountBasis) {
    return false;
  }

  if (!facility.ukefExposure || !facility.facilitySnapshot.ukefExposure) {
    return false;
  }

  if (!facility.dayCountBasis) {
    return false;
  }

  if (!facility.ukefExposure) {
    return false;
  }

  if (!facility.disbursementAmount) {
    return false;
  }

  return true;
};

module.exports = isFacilityValidForPremiumSchedule;
