const { mapPremiumFrequencyId, mapPremiumTypeId } = require('./map-premium-ids');
const isFacilityValidForPremiumSchedule = require('../../helpers/is-facility-valid-for-premium-schedule');
const mapProductGroup = require('./map-product-group');
const { stripCommas } = require('../../../utils/string');

const mapPremiumScheduleFacility = (facility, facilityExposurePeriod, facilityGuaranteeDates, skip) => {
  if (!skip) {
    if (!isFacilityValidForPremiumSchedule(facility, facilityExposurePeriod, facilityGuaranteeDates)) {
      return null;
    }
  }

  const exposurePeriod = facilityExposurePeriod.exposurePeriodInMonths
    ? Number(facilityExposurePeriod.exposurePeriodInMonths)
    : Number(facilityExposurePeriod);

  const mapped = {};

  const disbursementAmount = facility.disbursementAmount ?? facility.facilitySnapshot.disbursementAmount;

  mapped.premiumTypeId = mapPremiumTypeId(facility);
  mapped.premiumFrequencyId = mapPremiumFrequencyId(facility);

  mapped.productGroup = mapProductGroup(facility.type ?? facility.facilitySnapshot.type);

  mapped.facilityURN = facility.ukefFacilityId ?? Number(facility.facilitySnapshot.ukefFacilityId);

  mapped.guaranteeCommencementDate = facilityGuaranteeDates.guaranteeCommencementDate;
  mapped.guaranteeExpiryDate = facilityGuaranteeDates.guaranteeExpiryDate;
  mapped.guaranteeFeePercentage = facility.guaranteeFee ?? Number(facility.facilitySnapshot.guaranteeFeePayableByBank);
  mapped.guaranteePercentage = facility.coverPercentage ?? Number(facility.facilitySnapshot.coveredPercentage);

  mapped.dayBasis = String(facility.dayCountBasis ?? facility.facilitySnapshot.dayCountBasis);
  mapped.exposurePeriod = Number(facilityExposurePeriod);
  mapped.maximumLiability = facility.ukefExposure ?? Number(facility.facilitySnapshot.ukefExposure);

  mapped.dayBasis = String(facility.dayCountBasis ?? facility.facilitySnapshot.dayCountBasis);
  mapped.exposurePeriod = exposurePeriod;
  mapped.maximumLiability = facility.ukefExposure ?? Number(facility.facilitySnapshot.ukefExposure);

  mapped.cumulativeAmount = 0;

  if (disbursementAmount) {
    mapped.cumulativeAmount = facility.disbursementAmount ?? Number(stripCommas(facility.facilitySnapshot.disbursementAmount));
  }

  return mapped;
};

module.exports = mapPremiumScheduleFacility;
