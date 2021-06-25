const CONSTANTS = require('../../constants');
const { getPremiumFrequencyId, getPremiumTypeId } = require('../helpers/get-premium-frequency-values');
const isFacilityValidForPremiumSchedule = require('../helpers/is-facility-valid-for-premium-schedule');

const mapPremiumScheduleFacility = (facility, facilityExposurePeriod, facilityGuaranteeDates) => {
  if (!isFacilityValidForPremiumSchedule(facility, facilityExposurePeriod, facilityGuaranteeDates)) {
    return null;
  }
  const map = {};

  let premiumFrequencyId = 0;
  let premiumTypeId = 0;

  premiumFrequencyId = getPremiumFrequencyId(facility);
  premiumTypeId = getPremiumTypeId(facility, premiumTypeId);

  const cumulativeAmount = facility.disbursementAmount ? Number(facility.disbursementAmount) : 0;

  map.facilityURN = Number(facility.ukefFacilityID);
  map.productGroup = facility.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND
    ? CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.BOND
    : CONSTANTS.FACILITIES.FACILITY_PRODUCT_GROUP.LOAN;
  map.premiumTypeId = premiumTypeId;
  map.premiumFrequencyId = premiumFrequencyId;
  map.guaranteeCommencementDate = facilityGuaranteeDates.guaranteeCommencementDate;
  map.guaranteeExpiryDate = facilityGuaranteeDates.guaranteeExpiryDate;
  map.guaranteeFeePercentage = Number(facility.guaranteeFeePayableByBank);
  map.guaranteePercentage = Number(facility.coveredPercentage);

  map.dayBasis = facility.dayCountBasis;
  map.exposurePeriod = facilityExposurePeriod
    ? facilityExposurePeriod.exposurePeriodInMonths
    : 0;
  map.cumulativeAmount = cumulativeAmount;
  map.maximumLiability = facility.ukefExposure
    ? Number(facility.ukefExposure.split('.')[0].replace(/,/g, ''))
    : 0;
  return map;
};

module.exports = mapPremiumScheduleFacility;
