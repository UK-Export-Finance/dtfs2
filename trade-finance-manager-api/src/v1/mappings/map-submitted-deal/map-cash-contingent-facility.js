const { isValid } = require('date-fns');
const { convertDateToTimestamp } = require('../../../utils/date');
const mapGefFacilityFeeType = require('../../rest-mappings/mappings/gef-facilities/mapGefFacilityFeeType');
const CONSTANTS = require('../../../constants');

const mapCoverStartDate = (facility) => {
  const { coverStartDate } = facility;

  if (coverStartDate && isValid(new Date(coverStartDate))) {
    return convertDateToTimestamp(coverStartDate);
  }

  return null;
};

const mapFacilityStage = (hasBeenIssued) => {
  if (hasBeenIssued) {
    return CONSTANTS.FACILITIES.FACILITY_STAGE.ISSUED;
  }

  return CONSTANTS.FACILITIES.FACILITY_STAGE.COMMITMENT;
};

const mapCashContingentFacility = (facility) => {
  const {
    _id,
    ukefFacilityId,
    type,
    hasBeenIssued,
    value,
    currency,
    monthsOfCover,
    coverPercentage,
    ukefExposure,
    coverEndDate,
    name,
    guaranteeFee,
    feeType,
    feeFrequency,
    dayCountBasis,
    hasBeenIssuedAndAcknowledged,
    tfm,
    isUsingFacilityEndDate,
    facilityEndDate,
    bankReviewDate,
  } = facility;

  const mapped = {
    _id,
    ukefFacilityId,
    type,
    currencyCode: currency.id,
    value,
    coverPercentage,
    hasBeenIssued,
    ukefGuaranteeInMonths: monthsOfCover || 0,
    ukefExposure,
    coverStartDate: mapCoverStartDate(facility),
    coverEndDate,
    bankReference: name,
    guaranteeFee,
    feeType: mapGefFacilityFeeType(feeType),
    feeFrequency,
    dayCountBasis,
    hasBeenIssuedAndAcknowledged,
    tfm,
    isUsingFacilityEndDate,
    facilityEndDate,
    bankReviewDate,
  };

  // these extra fields are only used in GEF submission confirmation email
  mapped.interestPercentage = facility.interestPercentage;
  mapped.shouldCoverStartOnSubmission = facility.shouldCoverStartOnSubmission;
  mapped.facilityStage = mapFacilityStage(hasBeenIssued);

  return mapped;
};

module.exports = {
  mapCoverStartDate,
  mapFacilityStage,
  mapCashContingentFacility,
};
