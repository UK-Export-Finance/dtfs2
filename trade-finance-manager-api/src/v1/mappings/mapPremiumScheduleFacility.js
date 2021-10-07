const CONSTANTS = require('../../constants');
const { getPremiumFrequencyId, getPremiumTypeId } = require('../helpers/get-premium-frequency-values');
const isFacilityValidForPremiumSchedule = require('../helpers/is-facility-valid-for-premium-schedule');
const { stripCommas } = require('../../utils/string');

const mapPremiumScheduleFacility = (facility, facilityExposurePeriod, facilityGuaranteeDates) => {
  if (!isFacilityValidForPremiumSchedule(facility, facilityExposurePeriod, facilityGuaranteeDates)) {
    return null;
  }

  const mapped = {};

  mapped.premiumTypeId = getPremiumTypeId(facility);
  mapped.premiumFrequencyId = getPremiumFrequencyId(facility);

  mapped.cumulativeAmount = 0;
  if (facility.disbursementAmount) {
    mapped.cumulativeAmount = Number(stripCommas(facility.disbursementAmount));
  }

  mapped.facilityURN = facility.ukefFacilityID;

  mapped.productGroup = facility.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND
    ? CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.BOND
    : CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.LOAN;


  mapped.guaranteeCommencementDate = facilityGuaranteeDates.guaranteeCommencementDate;
  mapped.guaranteeExpiryDate = facilityGuaranteeDates.guaranteeExpiryDate;
  mapped.guaranteeFeePercentage = facility.guaranteeFee;
  mapped.guaranteePercentage = facility.coverPercentage;

  mapped.dayBasis = facility.dayCountBasis;

  mapped.exposurePeriod = 0;
  if (facilityExposurePeriod) {
    mapped.exposurePeriod = facilityExposurePeriod;
  }

  mapped.maximumLiability = 0;
  if (facility.ukefExposure) {
    mapped.maximumLiability = facility.ukefExposure;
  }

  return mapped;
};

module.exports = mapPremiumScheduleFacility;
