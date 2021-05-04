const CONSTANTS = require('../../constants');

function getPremiumFrequencyId(facility) {
  let premiumFrequencyId = CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.UNDEFINED;

  let searchString = '';
  if (facility.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
    searchString = facility.feeFrequency ? facility.feeFrequency.toLowerCase() : '';
  } else {
    searchString = facility.premiumFrequency ? facility.premiumFrequency.toLowerCase() : '';
  }
  if (facility.premiumFrequency) {
    switch (searchString) {
      case 'monthly':
        premiumFrequencyId = CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.MONTHLY;
        break;
      case 'quarterly':
        premiumFrequencyId = CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.QUARTERLY;
        break;
      case 'semi-annually':
        premiumFrequencyId = CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.SEMIANNUALLY;
        break;
      case 'annually':
        premiumFrequencyId = CONSTANTS.FACILITIES.FACILITY_PREMIUM_FREQUENCY_ID.ANNUALLY;
        break;
      default:
        throw new Error(`facility.feeFrequency "${facility.feeFrequency}" not valid.`);
    }
  }
  return premiumFrequencyId;
}

function getPremiumTypeId(facility) {
  let premiumTypeId = 0;
  let searchString = '';
  if (facility.facilityType === CONSTANTS.FACILITIES.FACILITY_TYPE.BOND) {
    searchString = facility.feeType ? facility.feeType.toLowerCase() : '';
  } else {
    searchString = facility.premiumType ? facility.premiumType.toLowerCase() : '';
  }
  switch (searchString) {
    case 'in advance':
      premiumTypeId = CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ADVANCE;
      break;
    case 'in arrears':
      premiumTypeId = CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.IN_ARREARS;
      break;
    case 'at maturity':
      premiumTypeId = CONSTANTS.FACILITIES.FACILITY_PREMIUM_TYPE_ID.AT_MATURITY;
      break;
    default:
      throw new Error(`facility.feeType "${facility.feeType}" not valid.`);
  }
  return premiumTypeId;
}

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
  if (!facility.coveredPercentage) {
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

const mapPremiumScheduleFalicity = (facility, facilityExposurePeriod, facilityGuaranteeDates) => {
  if (!isFacilityValidForPremiumSchedule(facility, facilityExposurePeriod, facilityGuaranteeDates)) {
    return null;
  }
  const map = {};
  let premiumFrequencyId = 0;
  let premiumTypeId = 0;
  let cumulativeAmount = null;
  premiumFrequencyId = getPremiumFrequencyId(facility);
  premiumTypeId = getPremiumTypeId(facility, premiumTypeId);
  cumulativeAmount = facility.disbursementAmount ? Number(facility.disbursementAmount) : null;

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

module.exports = mapPremiumScheduleFalicity;
