const { mapPremiumFrequencyId, mapPremiumTypeId } = require('./map-premium-ids');
const isFacilityValidForPremiumSchedule = require('../../helpers/is-facility-valid-for-premium-schedule');
const mapProductGroup = require('./map-product-group');

const mapPremiumScheduleFacility = (facility, facilityExposurePeriod, facilityGuaranteeDates) => {
  if (!isFacilityValidForPremiumSchedule(facility, facilityExposurePeriod, facilityGuaranteeDates)) {
    return null;
  }

  const mapped = {};

  mapped.premiumTypeId = mapPremiumTypeId(facility);
  mapped.premiumFrequencyId = mapPremiumFrequencyId(facility);

  mapped.productGroup = mapProductGroup(facility.facilityType);

  mapped.facilityURN = facility.ukefFacilityID;

  mapped.guaranteeCommencementDate = facilityGuaranteeDates.guaranteeCommencementDate;
  mapped.guaranteeExpiryDate = facilityGuaranteeDates.guaranteeExpiryDate;
  mapped.guaranteeFeePercentage = facility.guaranteeFee;
  mapped.guaranteePercentage = facility.coverPercentage;

  mapped.dayBasis = String(facility.dayCountBasis);
  mapped.exposurePeriod = facilityExposurePeriod;
  mapped.maximumLiability = facility.ukefExposure;

  mapped.cumulativeAmount = 0;
  if (facility.disbursementAmount) {
    mapped.cumulativeAmount = facility.disbursementAmount;
  }

  return mapped;
};

module.exports = mapPremiumScheduleFacility;
